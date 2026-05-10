import { supabase } from './supabase';

export const api = {
  user: {
    getMe: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      return data;
    },
    
    updateProfile: async (updates: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date()
        });

      if (error) throw error;
      return data;
    },

    getByHandle: async (handle: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', handle)
        .maybeSingle();
      return data;
    },

    getStats: async (userId: string) => {
      const [followers, following] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
      ]);
      return {
        followers: followers.count || 0,
        following: following.count || 0
      };
    },

    search: async (query: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${query}%,handle.ilike.%${query}%`)
        .limit(10);
      return data || [];
    },

    getFollowers: async (userId: string) => {
      const { data, error } = await supabase
        .from('follows')
        .select('follower:profiles!follows_follower_id_fkey(*)')
        .eq('following_id', userId);
      
      if (error) throw error;
      return data?.map(item => item.follower) || [];
    },

    getFollowing: async (userId: string) => {
      const { data, error } = await supabase
        .from('follows')
        .select('following:profiles!follows_following_id_fkey(*)')
        .eq('follower_id', userId);
      
      if (error) throw error;
      return data?.map(item => item.following) || [];
    },

    follow: async (followingId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('follows')
        .insert([{ follower_id: user.id, following_id: followingId }]);
      
      if (error) throw error;

      // Trigger notification
      await api.notifications.create(followingId, 'follow', user.id);
    },

    unfollow: async (followingId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId);
      
      if (error) throw error;
    },

    isFollowing: async (followingId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .maybeSingle();
      
      return !!data;
    }
  },

  posts: {
    getAll: async () => {
      const { data } = await supabase
        .from('posts')
        .select(`*, user:profiles(*)`)
        .order('created_at', { ascending: false });
      return data || [];
    },

    getByUser: async (userId: string) => {
      const { data } = await supabase
        .from('posts')
        .select(`*, user:profiles(*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return data || [];
    },

    create: async (post: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert([{ ...post, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    search: async (query: string) => {
      const { data } = await supabase
        .from('posts')
        .select(`*, user:profiles(*)`)
        .ilike('content', `%${query}%`)
        .limit(15);
      return data || [];
    },

    getFollowingFeed: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get IDs of people we follow
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      const followingIds = following?.map(f => f.following_id) || [];
      if (followingIds.length === 0) return [];

      const { data } = await supabase
        .from('posts')
        .select(`*, user:profiles(*)`)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false });
      
      return data || [];
    },

    getWorldFeed: async () => {
      // Real Engagement Algo: Uses the database view 'trending_posts'
      // which calculates: (likes*2 + comments*3) / (age_in_hours)^1.5
      const { data } = await supabase
        .from('trending_posts')
        .select(`*, user:profiles(*)`)
        .order('engagement_score', { ascending: false })
        .limit(50);
      
      return data || [];
    },

    like: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: user.id }]);
      
      if (error && error.code !== '23505') throw error; // Ignore if already liked
    },

    unlike: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },

    hasLiked: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      return !!data;
    }
  },

  messages: {
    getAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      return data || [];
    },

    getConversations: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!data) return [];

      const conversationsMap = new Map<string, any>();

      for (const msg of data) {
        const isMeSender = msg.sender_id === user.id;
        const otherUser = isMeSender ? msg.receiver : msg.sender;
        if (!otherUser) continue;

        const otherUserId = otherUser.id;

        if (!conversationsMap.has(otherUserId)) {
          const date = new Date(msg.created_at);
          const now = new Date();
          const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          const timeString = isToday 
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

          conversationsMap.set(otherUserId, {
            id: otherUserId, 
            user: otherUser,
            lastMessage: msg.content,
            time: timeString,
            unread: 0,
            isOnline: false,
            isPinned: false,
            rawDate: date.getTime()
          });
        }

        if (!isMeSender && !msg.is_read) {
          conversationsMap.get(otherUserId).unread += 1;
        }
      }

      // Sort by most recent
      return Array.from(conversationsMap.values()).sort((a, b) => b.rawDate - a.rawDate);
    },

    getThread: async (otherUserId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('messages')
        .select(`*`)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      return data || [];
    },

    send: async (receiverId: string, content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert([{ sender_id: user.id, receiver_id: receiverId, content }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    markAsRead: async (senderId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id);
    }
  },

  notifications: {
    getAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('notifications')
        .select(`*, actor:profiles!notifications_actor_id_fkey(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      return data || [];
    },

    create: async (userId: string, type: string, actorId: string, targetId?: string) => {
      const { error } = await supabase
        .from('notifications')
        .insert([{ 
          user_id: userId, 
          type, 
          actor_id: actorId, 
          target_id: targetId 
        }]);
      
      if (error) console.error('Notification creation error:', error);
    }
  }
};
