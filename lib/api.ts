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

    follow: async (followingId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('follows')
        .insert([{ follower_id: user.id, following_id: followingId }]);
      
      if (error) throw error;
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
    }
  }
};
