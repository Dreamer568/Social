import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Avatar } from '../Avatar';
import { PostCard } from '../PostCard';
import { Spacing, BorderRadius } from '../../constants/theme';
import { SCREEN_WIDTH } from './constants';

export const ProfileSection = ({ colors, posts, router, onEditPress }: any) => {
  return (
    <ScrollView style={[styles.sectionContainer, { width: SCREEN_WIDTH }]} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.profileCentered}>
        <View style={styles.profileAvatarLarge}>
          <Avatar size={100} uri="https://i.pravatar.cc/150?u=me" />
        </View>
        
        <Text style={[styles.profileNameLarge, { color: colors.text }]}>Human Being</Text>
        <Text style={[styles.profileHandleLarge, { color: colors.textSecondary }]}>@yourhandle</Text>
        <Text style={[styles.profileBioCentered, { color: colors.textSecondary }]}>
          Human. Thinker. Explorer. 🌿{"\n"}Building Veritas for a better social web.
        </Text>

        <View style={styles.profileStatsRow}>
          <View style={styles.profileStatItem}>
            <Text style={[styles.profileStatValue, { color: colors.text }]}>1.2k</Text>
            <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Followers</Text>
          </View>
          <View style={styles.profileStatItem}>
            <Text style={[styles.profileStatValue, { color: colors.text }]}>420</Text>
            <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Friends</Text>
          </View>
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
