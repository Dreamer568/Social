import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { PostCard } from '../../components/PostCard';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const handle = Array.isArray(id) ? id[0] : id || 'user';
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  // Mock data for this specific user
  const user = {
    name: handle.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'User',
    handle: handle,
    bio: 'Digital explorer and content creator. Passionate about minimalism and technology. 🌿',
    followers: '1.5k',
    following: '320',
    avatar: `https://i.pravatar.cc/150?u=${handle}`
  };

  const MOCK_USER_POSTS = [
    {
      id: 'p1',
      user: { name: user.name, handle: user.handle, avatar_url: user.avatar },
      content: 'Just exploring the new Veritas interface. It feels so fluid!',
      created_at: '2h ago',
      likes: 45, comments: 4,
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.profileCentered}>
          <View style={styles.profileAvatarLarge}>
            <Avatar size={100} uri={user.avatar} />
          </View>
          
          <Text style={[styles.profileNameLarge, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.profileHandleLarge, { color: colors.textSecondary }]}>@{user.handle}</Text>
          
          <Text style={[styles.profileBioCentered, { color: colors.text }]}>
            {user.bio}
          </Text>

          <View style={styles.profileStatsRow}>
            <View style={styles.profileStatItem}>
              <Text style={[styles.profileStatValue, { color: colors.text }]}>{user.followers}</Text>
              <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Followers</Text>
            </View>
            <View style={styles.profileStatItem}>
              <Text style={[styles.profileStatValue, { color: colors.text }]}>{user.following}</Text>
              <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Following</Text>
            </View>
          </View>

          <View style={styles.profileActionRow}>
            <TouchableOpacity style={[styles.followButton, { backgroundColor: colors.accent }]}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.messageButton, { borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => router.push(`/chat/${handle}` as any)}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.sectionHeader, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Posts</Text>
        </View>
        
        {MOCK_USER_POSTS.map(post => <PostCard key={post.id} {...post} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  },
  followButtonText: {
    color: 'white',
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
});
