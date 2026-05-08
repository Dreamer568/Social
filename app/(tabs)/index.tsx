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
      const [allPosts, allMessages, userData] = await Promise.all([
        api.posts.getAll(),
        api.messages.getAll(),
        api.user.getMe()
      ]);
      setPosts(allPosts as any);
      setMessages(allMessages);
      setMe(userData);
    } catch (error) {
      console.error('Refresh data error:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData(true);

    // Listen for auth changes to refresh data (like when you log in/out)
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

  const onBlockUser = (user: any) => {
    setBlockedUsers(prev => [...prev, user]);
    setMessages(prev => prev.filter(m => m.user.handle !== user.handle));
  };

  const onUnblockUser = (handle: string) => {
    setBlockedUsers(prev => prev.filter(u => u.handle !== handle));
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

  const indicatorTranslate = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2],
    outputRange: [0, (SCREEN_WIDTH - 40) / 3, ((SCREEN_WIDTH - 40) / 3) * 2],
    extrapolate: 'clamp',
  });

  // Filter posts for user profile
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
          me={me}
          onEditPress={() => setShowEditProfile(true)}
        />
      </Animated.ScrollView>

      {/* Persistent Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => scrollTo(0)} style={styles.tabItem}>
            <Ionicons name={activeIndex === 0 ? "home" : "home-outline"} size={26} color={activeIndex === 0 ? colors.accent : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollTo(1)} style={styles.tabItem}>
            <Ionicons name={activeIndex === 1 ? "chatbubbles" : "chatbubbles-outline"} size={26} color={activeIndex === 1 ? colors.accent : colors.textSecondary} />
            {messages.some(m => !m.is_read) && <View style={[styles.badge, { backgroundColor: colors.accent }]} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollTo(2)} style={styles.tabItem}>
            <Ionicons name={activeIndex === 2 ? "person" : "person-outline"} size={26} color={activeIndex === 2 ? colors.accent : colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.indicator, { backgroundColor: colors.accent, transform: [{ translateX: indicatorTranslate }] }]} />
      </View>

      {/* Overlays */}
      {openChatUser && <ChatOverlay user={openChatUser} onClose={() => setOpenChatUser(null)} />}
      {showNotifications && <NotificationsOverlay onClose={() => setShowNotifications(false)} />}
      {showEditProfile && <EditProfileOverlay onClose={() => setShowEditProfile(false)} onSave={() => { setShowEditProfile(false); refreshData(); }} />}
      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bottomBar: { position: 'absolute', bottom: 0, width: SCREEN_WIDTH, height: 85, paddingBottom: 25, borderTopWidth: 1 },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: '100%' },
  tabItem: { alignItems: 'center', justifyContent: 'center', width: SCREEN_WIDTH / 3, height: '100%' },
  indicator: { position: 'absolute', top: -1, left: 20, width: (SCREEN_WIDTH - 40) / 3, height: 3, borderRadius: 3 },
  badge: { position: 'absolute', top: 12, right: 35, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: 'white' },
});
