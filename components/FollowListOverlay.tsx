import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  useColorScheme,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Avatar } from './Avatar';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { api } from '../lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const FollowListOverlay = ({ userId, type, onClose }: any) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8
    }).start();

    loadList();
  }, [userId, type]);

  const loadList = async () => {
    setLoading(true);
    try {
      if (type === 'followers') {
        const data = await api.user.getFollowers(userId);
        setUsers(data);
      } else {
        const data = await api.user.getFollowing(userId);
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading follow list:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Animated.View style={[
      styles.overlay, 
      { backgroundColor: colors.background, transform: [{ translateX: slideAnim }] }
    ]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {type === 'followers' ? 'Followers' : 'Following'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.userRow}
              onPress={() => handleUserPress(item.handle)}
            >
              <Avatar uri={item.avatar_url} size={48} />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.userHandle, { color: colors.textSecondary }]}>@{item.handle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary + '66'} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name={type === 'followers' ? "people-outline" : "person-add-outline"} 
                size={64} 
                color={colors.textSecondary + '33'} 
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </Text>
            </View>
          }
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1400 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, marginTop: 40 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backButton: { padding: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  userInfo: { flex: 1, marginLeft: Spacing.md },
  userName: { fontSize: 16, fontWeight: '700' },
  userHandle: { fontSize: 14 },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '500' },
});
