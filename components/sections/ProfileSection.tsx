import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Avatar } from '../Avatar';
import { PostCard } from '../PostCard';
import { Spacing, BorderRadius } from '../../constants/theme';
import { SCREEN_WIDTH } from './constants';

export const ProfileSection = ({ colors, posts, router, onEditPress, me, stats }: any) => {
  return (
    <ScrollView style={[styles.sectionContainer, { width: SCREEN_WIDTH }]} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.profileCentered}>
        <View style={styles.profileAvatarLarge}>
          <Avatar size={100} uri={me?.avatar_url || "https://i.pravatar.cc/150?u=me"} />
        </View>
        
        <Text style={[styles.profileNameLarge, { color: colors.text }]}>{me?.name || 'Human Being'}</Text>
        <Text style={[styles.profileHandleLarge, { color: colors.textSecondary }]}>@{me?.handle || 'yourhandle'}</Text>
        <Text style={[styles.profileBioCentered, { color: colors.textSecondary }]}>
          {me?.bio || 'Human. Thinker. Explorer. 🌿\nBuilding Sync for a better social web.'}
        </Text>

        <View style={styles.profileStatsRow}>
          <TouchableOpacity 
            style={styles.profileStatItem}
            onPress={() => router.push({ pathname: '/user/list', params: { userId: me?.id, type: 'followers', name: me?.name } })}
          >
            <Text style={[styles.profileStatValue, { color: colors.text }]}>{stats?.followers || '0'}</Text>
            <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileStatItem}
            onPress={() => router.push({ pathname: '/user/list', params: { userId: me?.id, type: 'following', name: me?.name } })}
          >
            <Text style={[styles.profileStatValue, { color: colors.text }]}>{stats?.following || '0'}</Text>
            <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Following</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.profileEditButton, { borderColor: colors.border }]}
          onPress={onEditPress}
        >
          <Text style={[styles.profileEditButtonText, { color: colors.text }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.profileSectionHeader, { borderTopColor: colors.border }]}>
        <Text style={[styles.profileSectionTitle, { color: colors.text }]}>Posts</Text>
      </View>
      
      {posts.map((post: any) => <PostCard key={post.id} {...post} />)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
  },
  profileCentered: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
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
    fontWeight: '600',
    marginBottom: Spacing.sm,
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
  profileEditButton: {
    borderWidth: 1,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xxl,
  },
  profileEditButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  profileSectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    marginTop: Spacing.md,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
});
