import React, { useState, useEffect, useRef } from 'react';
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

// --- MOCK DATA ---
const MOCK_POSTS: PostProps[] = [
  { id: '1', user: { name: 'Jane Doe', handle: 'janedoe', avatar_url: 'https://i.pravatar.cc/150?u=jane' }, content: 'This app feels so refreshingly human. No algorithms, no AI noise. Just pure expression. Love it! 🌿', created_at: '2h ago', likes: 124, comments: 12 },
  { id: '2', user: { name: 'Alex Smith', handle: 'asmith', avatar_url: 'https://i.pravatar.cc/150?u=alex' }, content: 'Just finished a long hike. The silence of the mountains is something we should all experience more often.', media_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop', media_type: 'image', created_at: '4h ago', likes: 89, comments: 8 },
  { id: '3', user: { name: 'Sarah Connor', handle: 'sconnor', avatar_url: 'https://i.pravatar.cc/150?u=sarah' }, content: 'Authenticity is the new luxury.', created_at: '5h ago', likes: 256, comments: 45 },
  { id: '4', user: { name: 'Marcus Chen', handle: 'mchen', avatar_url: 'https://i.pravatar.cc/150?u=marcus' }, content: 'Morning coffee and a blank notebook. My favorite way to start the day.', media_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop', media_type: 'image', created_at: '6h ago', likes: 42, comments: 3 },
  { id: '5', user: { name: 'Chloe Bennett', handle: 'chloeb', avatar_url: 'https://i.pravatar.cc/150?u=chloe' }, content: 'Unpopular opinion: we don’t need more productivity hacks. We need more naps and long walks without our phones.', created_at: '8h ago', likes: 512, comments: 89 },
  { id: '6', user: { name: 'Jordan Taylor', handle: 'jtaylor', avatar_url: 'https://i.pravatar.cc/150?u=jordan' }, content: 'The lighting in the studio today was just perfect.', media_url: 'https://images.unsplash.com/photo-1518131394553-8d960bf9830d?q=80&w=1000&auto=format&fit=crop', media_type: 'image', created_at: '12h ago', likes: 15, comments: 1 },
  { id: '7', user: { name: 'Maya Patel', handle: 'mayap', avatar_url: 'https://i.pravatar.cc/150?u=maya' }, content: 'Finally finished reading "The Art of Slow Living". Highly recommend to anyone feeling the burnout.', created_at: '1d ago', likes: 93, comments: 14 },
  { id: '8', user: { name: 'Liam Wilson', handle: 'liamw', avatar_url: 'https://i.pravatar.cc/150?u=liam' }, content: 'Rainy days in the city have a soul of their own.', media_url: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1000&auto=format&fit=crop', media_type: 'image', created_at: '1d ago', likes: 210, comments: 22 },
  { id: '9', user: { name: 'Sophie Martin', handle: 'smartin', avatar_url: 'https://i.pravatar.cc/150?u=sophie' }, content: 'Deleting all my other social apps today. Let’s see how long this experiment lasts. ✌️', created_at: '2d ago', likes: 340, comments: 56 },
  { id: '10', user: { name: 'Daniel Kim', handle: 'dkim', avatar_url: 'https://i.pravatar.cc/150?u=daniel' }, content: 'Found this hidden gem of a bakery in the West End. The sourdough is life-changing.', media_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop', media_type: 'image', created_at: '3d ago', likes: 77, comments: 9 }
];

const MOCK_MESSAGES = [
  { id: '1', user: { name: 'David Miller', handle: 'davidm', avatar_url: 'https://i.pravatar.cc/150?u=david' }, lastMessage: 'See you tomorrow at the cafe!', time: '10:30 AM', unread: 2, isOnline: true },
  { id: '3', user: { name: 'Marcus Chen', handle: 'mchen', avatar_url: 'https://i.pravatar.cc/150?u=marcus' }, lastMessage: 'Do you have the link to that book?', time: '9:45 AM', unread: 1, isOnline: true },
  { id: '4', user: { name: 'Chloe Bennett', handle: 'chloeb', avatar_url: 'https://i.pravatar.cc/150?u=chloe' }, lastMessage: 'I completely agree with your last post.', time: '8:15 AM', unread: 0, isOnline: true },
  { id: '2', user: { name: 'Elena Rodriguez', handle: 'elena_r', avatar_url: 'https://i.pravatar.cc/150?u=elena' }, lastMessage: 'That photo you posted is amazing!', time: 'Yesterday', unread: 0, isOnline: false },
  { id: '6', user: { name: 'Aria Stark', handle: 'astark', avatar_url: 'https://i.pravatar.cc/150?u=aria' }, lastMessage: 'Just sent over the drafts.', time: 'Sunday', unread: 5, isOnline: false },
  { id: '5', user: { name: 'Lucas Thorne', handle: 'lthorne', avatar_url: 'https://i.pravatar.cc/150?u=lucas' }, lastMessage: 'Are we still on for the gallery?', time: 'Monday', unread: 0, isOnline: true },
  { id: '7', user: { name: 'Julian Voss', handle: 'jvoss', avatar_url: 'https://i.pravatar.cc/150?u=julian' }, lastMessage: 'Haha, I knew you would like it!', time: 'Oct 12', unread: 0, isOnline: false },
  { id: '8', user: { name: 'Nina Simone', handle: 'nsimone', avatar_url: 'https://i.pravatar.cc/150?u=nina' }, lastMessage: 'Can you send the address again?', time: 'Oct 10', unread: 0, isOnline: false }
];

export default function MainApp() {
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedType, setFeedType] = useState('World');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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
          posts={MOCK_POSTS}
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
          posts={MOCK_POSTS.slice(0, 2)}
          router={router}
          onEditPress={() => setShowEditProfile(true)}
        />
      </Animated.ScrollView>

      {/* CUSTOM FLOATING TAB BAR */}
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
        <EditProfileOverlay onClose={() => setShowEditProfile(false)} />
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
