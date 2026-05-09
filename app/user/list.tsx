import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { SkeletonRow } from '../../components/SkeletonRow';
import { Colors, Spacing } from '../../constants/theme';
import { api } from '../../lib/api';

export default function UserListScreen() {
  const { userId, type, name } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  const title = type === 'followers' ? 'Followers' : 'Following';

  useEffect(() => {
    loadUsers();
  }, [userId, type]);

  const loadUsers = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      let data = [];
      if (type === 'followers') {
        data = await api.user.getFollowers(userId as string);
      } else {
        data = await api.user.getFollowing(userId as string);
      }
      setUsers(data);
    } catch (error) {
      console.error('Error loading user list:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.userRow, { borderBottomColor: colors.border }]}
      onPress={() => router.push(`/user/${item.handle}` as any)}
    >
      <Avatar uri={item.avatar_url} size={44} />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.userHandle, { color: colors.textSecondary }]}>@{item.handle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ 
        headerShown: false,
        title: title
      }} />
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
          {name && <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{name}</Text>}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7, 8]}
          renderItem={() => <SkeletonRow />}
          keyExtractor={(item) => item.toString()}
        />
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No {type} yet
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userHandle: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: Spacing.md,
  },
});
