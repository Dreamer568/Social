import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Avatar } from './Avatar';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { RichText } from './RichText';
import { api } from '../lib/api';

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
  id,
  user,
  content,
  media_url,
  media_type,
  created_at,
  likes,
  comments,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [likeLoading, setLikeLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  // Animation for the heart
  const heartScale = useRef(new Animated.Value(1)).current;

  // Check initial like state
  useEffect(() => {
    api.posts.hasLiked(id).then(setIsLiked).catch(() => {});
  }, [id]);

  const animateHeart = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 40 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
  };

  const handleLikeToggle = async () => {
    if (likeLoading) return;

    // Optimistic update — update the UI instantly
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    if (!wasLiked) animateHeart();

    setLikeLoading(true);
    try {
      if (wasLiked) {
        await api.posts.unlike(id);
      } else {
        await api.posts.like(id);
      }
    } catch (error) {
      // Revert on failure
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Like error:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

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
            @{user.handle} · {formatTime(created_at)}
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
          onPress={handleLikeToggle}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={isLiked ? '#F4212E' : colors.textSecondary} 
            />
          </Animated.View>
          <Text style={[styles.actionText, { color: isLiked ? '#F4212E' : colors.textSecondary }]}>
            {likeCount}
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
