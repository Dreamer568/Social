import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Animated,
  Dimensions,
  useColorScheme,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '../constants/theme';
import { api } from '../lib/api';
import { Avatar } from './Avatar';
import { PostCard } from './PostCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SearchOverlay = ({ onClose }: any) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8
    }).start();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const [userResults, postResults] = await Promise.all([
            api.user.search(query),
            api.posts.search(query)
          ]);
          setUsers(userResults);
          setPosts(postResults);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setUsers([]);
        setPosts([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true
    }).start(() => onClose());
  };

  const handleUserPress = (handle: string) => {
    handleClose();
    router.push(`/user/${handle}` as any);
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.handle) {
      return (
        <TouchableOpacity 
          style={styles.userItem} 
          onPress={() => handleUserPress(item.handle)}
        >
          <Avatar uri={item.avatar_url} size={48} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.userHandle, { color: colors.textSecondary }]}>@{item.handle}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return <PostCard {...item} />;
  };

  const combinedResults = [...users, ...posts];

  return (
    <Animated.View style={[
      styles.overlay, 
      { backgroundColor: colors.background, transform: [{ translateX: slideAnim }] }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search Sync"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {loading ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.length > 1 ? (
        <FlatList
          data={combinedResults}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            combinedResults.length > 0 ? (
              <Text style={[styles.resultsLabel, { color: colors.textSecondary }]}>
                {users.length} people · {posts.length} posts
              </Text>
            ) : null
          )}
          ListEmptyComponent={() => (
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No results found for "{query}"
                </Text>
              </View>
            ) : null
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary + '33'} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Search for people or topics
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginTop: 40 },
  backButton: { marginRight: Spacing.md },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 22, paddingHorizontal: 15 },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  listContent: { paddingBottom: 40 },
  resultsLabel: { padding: Spacing.lg, fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  userItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  userInfo: { marginLeft: Spacing.md },
  userName: { fontSize: 16, fontWeight: '700' },
  userHandle: { fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '500' },
});
