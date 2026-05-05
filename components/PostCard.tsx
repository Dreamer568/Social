import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

export interface PostProps {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar_url?: string;
  };
  content: string;
  media_url?: string;
  media_type?: 'image' | 'audio';
  created_at: string;
  likes: number;
  comments: number;
}

export const PostCard: React.FC<PostProps> = ({
  user,
  content,
  media_url,
  media_type,
  created_at,
  likes,
  comments,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Avatar uri={user.avatar_url} size={42} />
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={[styles.handle, { color: colors.textSecondary }]} numberOfLines={1}>
            @{user.handle} · {created_at}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
          <Text 
            style={[styles.content, { color: colors.text }]} 
            numberOfLines={expanded ? undefined : 4}
          >
            {content}
          </Text>
        </TouchableOpacity>

        {media_url && media_type === 'image' && (
          <Image 
            source={{ uri: media_url }} 
            style={[styles.image, { backgroundColor: colors.skeleton }]} 
            resizeMode="cover"
          />
        )}
        
        {media_url && media_type === 'audio' && (
          <View style={[styles.audioPlaceholder, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="play-circle" size={36} color={colors.accent} />
            <Text style={[styles.audioText, { color: colors.text }]}>Listen to voice note</Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border + '33' }]}>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>{comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setIsLiked(!isLiked)}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={isLiked ? colors.error : colors.textSecondary} 
            />
            <Text style={[styles.actionText, { color: isLiked ? colors.error : colors.textSecondary }]}>
              {isLiked ? likes + 1 : likes}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  name: {
    fontWeight: '700',
    fontSize: 15,
  },
  handle: {
    fontSize: 13,
  },
  moreButton: {
    padding: 4,
  },
  contentContainer: {
    marginBottom: Spacing.sm,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  audioPlaceholder: {
    width: '100%',
    height: 54,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  audioText: {
    marginLeft: Spacing.sm,
    fontWeight: '500',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  actionGroup: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.xl,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  shareButton: {
    padding: 4,
  },
});
