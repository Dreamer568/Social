import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { PostCard } from '../../components/PostCard';
import { FollowListOverlay } from '../../components/FollowListOverlay';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { api } from '../../lib/api';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const handle = Array.isArray(id) ? id[0] : id || '';
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFollowList, setShowFollowList] = useState<'followers' | 'following' | null>(null);

  useEffect(() => {
    loadProfile();
  }, [handle]);

  const loadProfile = async () => {
    if (!handle) return;
    setLoading(true);
    try {
      const userData = await api.user.getByHandle(handle);
      if (userData) {
        setUser(userData);
        const [userPosts, followingStatus, userStats] = await Promise.all([
          api.posts.getByUser(userData.id),
          api.user.isFollowing(userData.id),
          api.user.getStats(userData.id)
        ]);
        setPosts(userPosts);
        setIsFollowing(followingStatus);
        setStats(userStats);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || actionLoading) return;
    setActionLoading(true);
    try {
      if (isFollowing) {
        await api.user.unfollow(user.id);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
      } else {
        await api.user.follow(user.id);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>User not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.accent }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.profileCentered}>
          <View style={styles.profileAvatarLarge}>
            <Avatar size={100} uri={user.avatar_url} />
          </View>
          
          <Text style={[styles.profileNameLarge, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.profileHandleLarge, { color: colors.textSecondary }]}>@{user.handle}</Text>
          
          <Text style={[styles.profileBioCentered, { color: colors.text }]}>
            {user.bio || 'No bio yet. 🌿'}
          </Text>

          <View style={styles.profileStatsRow}>
            <TouchableOpacity 
              style={styles.profileStatItem}
              onPress={() => setShowFollowList('followers')}
            >
              <Text style={[styles.profileStatValue, { color: colors.text }]}>{stats.followers}</Text>
              <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileStatItem}
              onPress={() => setShowFollowList('following')}
            >
              <Text style={[styles.profileStatValue, { color: colors.text }]}>{stats.following}</Text>
              <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Following</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileActionRow}>
            <TouchableOpacity 
              style={[
                styles.followButton, 
                { backgroundColor: isFollowing ? colors.surface : colors.accent, borderColor: colors.border, borderWidth: isFollowing ? 1 : 0 }
              ]}
              onPress={handleFollowToggle}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={isFollowing ? colors.text : "white"} />
              ) : (
                <Text style={[styles.followButtonText, { color: isFollowing ? colors.text : "white" }]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.messageButton, { borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => router.push(`/chat/${user.handle}` as any)}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.sectionHeader, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Posts</Text>
        </View>
        
        {posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} {...post} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.textSecondary }}>No posts yet</Text>
          </View>
        )}
      </ScrollView>

      {showFollowList && (
        <FollowListOverlay 
          userId={user.id} 
          type={showFollowList} 
          onClose={() => setShowFollowList(null)} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileCentered: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  profileAvatarLarge: {
    marginBottom: Spacing.md,
  },
  profileNameLarge: {
    fontSize: 22,
    fontWeight: '800',
  },
  profileHandleLarge: {
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  profileBioCentered: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  profileStatsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  profileStatItem: {
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  profileActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  followButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  }
});
