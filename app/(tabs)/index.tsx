import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Platform,
  useColorScheme,
  Dimensions,
  ScrollView,
  TextInput,
  Animated,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Internal Components
import { PostCard, PostProps } from '../../components/PostCard';
import { SkeletonPost } from '../../components/SkeletonPost';
import { SkeletonRow } from '../../components/SkeletonRow';
import { Avatar } from '../../components/Avatar';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- MOCK DATA ---
const MOCK_POSTS: PostProps[] = [
  {
    id: '1',
    user: { name: 'Jane Doe', handle: 'janedoe', avatar_url: 'https://i.pravatar.cc/150?u=jane' },
    content: 'This app feels so refreshingly human. No algorithms, no AI noise. Just pure expression. Love it! 🌿',
    created_at: '2h ago',
    likes: 124, comments: 12, reposts: 5,
  },
  {
    id: '2',
    user: { name: 'Alex Smith', handle: 'asmith', avatar_url: 'https://i.pravatar.cc/150?u=alex' },
    content: 'Just finished a long hike. The silence of the mountains is something we should all experience more often.',
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
    created_at: '4h ago',
    likes: 89, comments: 8, reposts: 2,
  },
  {
    id: '3',
    user: { name: 'Sarah Connor', handle: 'sconnor', avatar_url: 'https://i.pravatar.cc/150?u=sarah' },
    content: 'Authenticity is the new luxury.',
    created_at: '5h ago',
    likes: 256, comments: 45, reposts: 88,
  },
];

const MOCK_MESSAGES = [
  { id: '1', user: { name: 'David Miller', handle: 'davidm', avatar_url: 'https://i.pravatar.cc/150?u=david' }, lastMessage: 'See you tomorrow at the cafe!', time: '10:30 AM', unread: 2 },
  { id: '2', user: { name: 'Elena Rodriguez', handle: 'elena_r', avatar_url: 'https://i.pravatar.cc/150?u=elena' }, lastMessage: 'That photo you posted is amazing!', time: 'Yesterday', unread: 0 },
];

// --- SECTIONS ---

const HomeSection = ({ loading, colors, router }: any) => {
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={() => router.push('/search')}>
        <Ionicons name="search" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Veritas</Text>
      <TouchableOpacity onPress={() => router.push('/notifications')}>
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.sectionContainer, { width: SCREEN_WIDTH }]}>
      {renderHeader()}
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={() => <SkeletonPost />}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      ) : (
        <FlatList
          data={MOCK_POSTS}
          renderItem={({ item }) => <PostCard {...item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
};

const MessagesSection = ({ colors }: any) => {
  return (
    <View style={[styles.sectionContainer, { width: SCREEN_WIDTH }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput 
          placeholder="Search direct messages" 
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <FlatList
        data={MOCK_MESSAGES}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.messageRow}>
            <Avatar size={50} uri={item.user.avatar_url} />
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={[styles.messageName, { color: colors.text }]}>{item.user.name}</Text>
                <Text style={[styles.messageTime, { color: colors.textSecondary }]}>{item.time}</Text>
              </View>
              <Text style={[styles.messageText, { color: colors.textSecondary }]} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
};

const ProfileSection = ({ colors }: any) => {
  return (
    <ScrollView style={[styles.sectionContainer, { width: SCREEN_WIDTH }]} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={[styles.profileCover, { backgroundColor: colors.border }]} />
      <View style={styles.profileInfo}>
        <View style={styles.profileHeaderRow}>
          <View style={[styles.profileAvatarContainer, { borderColor: colors.background }]}>
            <Avatar size={80} uri="https://i.pravatar.cc/150?u=me" />
          </View>
          <TouchableOpacity style={[styles.editButton, { borderColor: colors.border }]}>
            <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.profileName, { color: colors.text }]}>Your Name</Text>
        <Text style={[styles.profileHandle, { color: colors.textSecondary }]}>@yourhandle</Text>
        <Text style={[styles.profileBio, { color: colors.text }]}>Human. Thinker. Explorer. 🌿</Text>
        
        <View style={styles.statsContainer}>
          <Text style={[styles.statValue, { color: colors.text }]}>420 <Text style={styles.statLabel}>Following</Text></Text>
          <Text style={[styles.statValue, { color: colors.text }]}>1.2k <Text style={styles.statLabel}>Followers</Text></Text>
        </View>
      </View>
      
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <Text style={[styles.tabText, { color: colors.text, borderBottomColor: colors.accent, borderBottomWidth: 3 }]}>Posts</Text>
        <Text style={[styles.tabText, { color: colors.textSecondary }]}>Media</Text>
        <Text style={[styles.tabText, { color: colors.textSecondary }]}>Likes</Text>
      </View>
      
      {MOCK_POSTS.slice(0, 1).map(post => <PostCard key={post.id} {...post} />)}
    </ScrollView>
  );
};

// --- MAIN SCREEN ---

export default function MainApp() {
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const scrollRef = useRef<ScrollView>(null);
  
  // Animation value for tab indicator
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false, listener: (event: any) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (index !== activeIndex) setActiveIndex(index);
    }}
  );

  const scrollTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  };

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
        <HomeSection loading={loading} colors={colors} router={router} />
        <MessagesSection colors={colors} />
        <ProfileSection colors={colors} />
      </Animated.ScrollView>

      {/* FAB (only on Home) */}
      {activeIndex === 0 && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: colors.accent }]}
          onPress={() => router.push('/new-post')}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}

      {/* CUSTOM FLOATING TAB BAR */}
      <View style={[styles.tabBar, { 
        backgroundColor: colorScheme === 'dark' ? 'rgba(28, 30, 33, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: colorScheme === 'dark' ? '#38444d' : '#e1e8ed',
      }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => scrollTo(0)}>
          <Ionicons name={activeIndex === 0 ? "home" : "home-outline"} size={26} color={activeIndex === 0 ? colors.accent : colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => scrollTo(1)}>
          <Ionicons name={activeIndex === 1 ? "chatbubble" : "chatbubble-outline"} size={26} color={activeIndex === 1 ? colors.accent : colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => scrollTo(2)}>
          <Ionicons name={activeIndex === 2 ? "person" : "person-outline"} size={26} color={activeIndex === 2 ? colors.accent : colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
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
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Messages specific
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: 22,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  messageRow: {
    flexDirection: 'row',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  messageName: {
    fontWeight: '700',
    fontSize: 16,
  },
  messageTime: {
    fontSize: 13,
  },
  messageText: {
    fontSize: 14,
  },
  // Profile specific
  profileCover: {
    height: 120,
  },
  profileInfo: {
    paddingHorizontal: Spacing.lg,
    marginTop: -40,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  profileAvatarContainer: {
    borderWidth: 4,
    borderRadius: 44,
  },
  editButton: {
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  editButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
  },
  profileHandle: {
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  profileBio: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  statValue: {
    fontWeight: '700',
    marginRight: Spacing.lg,
  },
  statLabel: {
    fontWeight: '400',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
  },
  tabText: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: Spacing.md,
    fontWeight: '700',
    fontSize: 15,
  },
});
