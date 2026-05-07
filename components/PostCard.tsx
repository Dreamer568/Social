import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Avatar } from './Avatar';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { RichText } from './RichText';

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
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push(`/user/${user.handle}` as any)}>
          <Avatar uri={user.avatar_url} size={42} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerText}
          onPress={() => router.push(`/user/${user.handle}` as any)}
        >
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={[styles.handle, { color: colors.textSecondary }]} numberOfLines={1}>
            @{user.handle} · {created_at}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <RichText content={content} />
      </View>

      {media_url && media_type === 'image' && (
        <Image 
          source={{ uri: media_url }} 
          style={styles.mediaImage}
          resizeMode="cover"
        />
      )}

      <View style={[styles.footer, { borderTopColor: colors.border + '33' }]}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
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

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={19} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  handle: {
    fontSize: 13,
    marginTop: 1,
  },
  moreButton: {
    padding: 4,
  },
  contentContainer: {
    marginBottom: Spacing.md,
  },
  mediaImage: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.xl,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});
