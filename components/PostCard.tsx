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
  reposts: number;
}

export const PostCard: React.FC<PostProps> = ({
  user,
  content,
  media_url,
  media_type,
  created_at,
  likes,
  comments,
  reposts,
}) => {
  const [expanded, setExpanded] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.header}>
        <Avatar uri={user.avatar_url} size={48} />
        <View style={styles.headerText}>
          <View style={styles.userRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={[styles.handle, { color: colors.textSecondary }]} numberOfLines={1}>
              @{user.handle} · {created_at}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
          <Text 
            style={[styles.content, { color: colors.text }]} 
            numberOfLines={expanded ? undefined : 3}
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
          <View style={[styles.audioPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="play-circle" size={40} color={colors.accent} />
            <Text style={[styles.audioText, { color: colors.text }]}>Audio Attachment</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>{comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="repeat-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>{reposts}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>{likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  userRow: {
    flexDirection: 'column',
  },
  name: {
    fontWeight: '700',
    fontSize: 16,
  },
  handle: {
    fontSize: 14,
    marginTop: 2,
  },
  contentContainer: {
    marginLeft: 0,
    marginTop: Spacing.xs,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  audioPlaceholder: {
    width: '100%',
    height: 60,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  audioText: {
    marginLeft: Spacing.md,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: Spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    marginLeft: 4,
  },
});
