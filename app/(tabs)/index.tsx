import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  useColorScheme,
  Animated,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

// Internal Components
import { PostProps } from '../../components/PostCard';
import { Colors } from '../../constants/theme';
import { HomeSection } from '../../components/sections/HomeSection';
import { MessagesSection } from '../../components/sections/MessagesSection';
import { ProfileSection } from '../../components/sections/ProfileSection';
import { SCREEN_WIDTH } from '../../components/sections/constants';

// Overlays
import { ChatOverlay } from '../../components/ChatOverlay';
import { NotificationsOverlay } from '../../components/NotificationsOverlay';
import { EditProfileOverlay } from '../../components/EditProfileOverlay';
import { SearchOverlay } from '../../components/SearchOverlay';

// API & Mock Data
import { api } from '../../lib/api';

export default function MainApp() {
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedType, setFeedType] = useState('World');
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [meStats, setMeStats] = useState({ followers: 0, following: 0 });
  
  // Overlay States
  const [openChatUser, setOpenChatUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Data Fetching Logic (Reusable)
  const refreshData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      // Fetch posts based on feed type
      const feedPosts = feedType === 'World' 
        ? await api.posts.getWorldFeed() 
        : await api.posts.getFollowingFeed();

      const [allMessages, userData] = await Promise.all([
        api.messages.getConversations(),
        api.user.getMe()
      ]);
      
      setPosts(feedPosts as any);
      setMessages(allMessages);
      setMe(userData);

      if (userData) {
        const stats = await api.user.getStats(userData.id);
        setMeStats(stats);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [feedType]);

  useEffect(() => {
    refreshData(true);

    // Keep the dynamic auth listener for zero-lag profile updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshData();
    });

    return () => subscription.unsubscribe();
  }, [refreshData]);

  // Handlers for Messaging
  const onPinChat = (id: string) => {
    setMessages(prev => {
      const msg = prev.find(m => m.id === id);
      if (!msg) return prev;
      const isPinned = (msg as any).isPinned;
      return [
        { ...msg, isPinned: !isPinned },
        ...prev.filter(m => m.id !== id)
      ].sort((a, b) => ((b as any).isPinned ? 1 : 0) - ((a as any).isPinned ? 1 : 0));
    });
  };

  const onRenameChat = (id: string, newName: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, user: { ...m.user, name: newName } } : m));
  };

  const onBlockUser = (id: string) => {
    const userToBlock = messages.find(m => m.id === id)?.user;
    if (userToBlock) {
      setBlockedUsers(prev => [...prev, { id, ...userToBlock }]);
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  const onUnblockUser = (id: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== id));
  };

  const onDeleteChat = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false, listener: (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (index !== activeIndex) setActiveIndex(index);
      }
    }
  );

  const scrollTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  // Exactly as in commit 6ca9f75
  const indicatorTranslate = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2],
    outputRange: [0, (SCREEN_WIDTH - 40) / 3, ((SCREEN_WIDTH - 40) / 3) * 2],
    extrapolate: 'clamp',
  });

  const profilePosts = posts.filter(post => post.user?.handle === me?.handle);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        <HomeSection 
          loading={loading} 
          colors={colors} 
          router={router} 
          feedType={feedType} 
          setFeedType={setFeedType} 
          colorScheme={colorScheme}
          posts={posts}
          onNotificationPress={() => setShowNotifications(true)}
          onSearchPress={() => setShowSearch(true)}
        />
        <MessagesSection 
          colors={colors} 
          router={router} 
          messages={messages}
          blockedUsers={blockedUsers}
          onPin={onPinChat}
          onRename={onRenameChat}
          onBlock={onBlockUser}
          onUnblock={onUnblockUser}
          onDelete={onDeleteChat}
          onChatPress={(chat: any) => setOpenChatUser(chat.user)}
        />
        <ProfileSection 
          colors={colors} 
          posts={profilePosts} 
          router={router} 
          onEditPress={() => setShowEditProfile(true)}
          me={me}
          stats={meStats}
        />
      </Animated.ScrollView>

      {/* CUSTOM FLOATING TAB BAR - RESTORED EXACTLY */}
      <View style={[styles.tabBar, {
        backgroundColor: colorScheme === 'dark' ? 'rgba(28, 30, 33, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: colorScheme === 'dark' ? '#38444d' : '#e1e8ed',
      }]}>
        <Animated.View style={[
          styles.tabIndicator,
          {
            backgroundColor: colors.accent + '22',
            width: (SCREEN_WIDTH - 40) / 3 - 20,
            transform: [{ translateX: indicatorTranslate }]
          }
        ]} />
        <TouchableOpacity style={styles.tabItem} onPress={() => scrollTo(0)}>
          <Ionicons name={activeIndex === 0 ? "home" : "home-outline"} size={24} color={activeIndex === 0 ? colors.accent : colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => scrollTo(1)}>
          <Ionicons name={activeIndex === 1 ? "chatbubble" : "chatbubble-outline"} size={24} color={activeIndex === 1 ? colors.accent : colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => scrollTo(2)}>
          <Ionicons name={activeIndex === 2 ? "person" : "person-outline"} size={24} color={activeIndex === 2 ? colors.accent : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* OVERLAYS (No Navigation flicker) */}
      {showNotifications && (
        <NotificationsOverlay onClose={() => setShowNotifications(false)} />
      )}
      {openChatUser && (
        <ChatOverlay 
          user={openChatUser} 
          onClose={() => setOpenChatUser(null)} 
          onProfilePress={(handle: string) => {
            setOpenChatUser(null);
            router.push(`/user/${handle}` as any);
          }}
        />
      )}
      {showEditProfile && (
        <EditProfileOverlay onClose={() => setShowEditProfile(false)} onSave={() => refreshData()} />
      )}
      {showSearch && (
        <SearchOverlay onClose={() => setShowSearch(false)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  tabIndicator: { position: 'absolute', height: 44, borderRadius: 22, left: 10 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', zIndex: 2 },
});
