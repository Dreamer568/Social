import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Platform,
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { SkeletonRow } from '../components/SkeletonRow';
import { Avatar } from '../components/Avatar';
import { Colors, Spacing } from '../constants/theme';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'like',
    user: { name: 'Jane Doe', avatar_url: 'https://i.pravatar.cc/150?u=jane' },
    text: 'liked your post',
    timestamp: '2m',
    icon: 'heart',
    iconColor: '#F4212E',
  },
  {
    id: '2',
    type: 'repost',
    user: { name: 'Alex Smith', avatar_url: 'https://i.pravatar.cc/150?u=alex' },
    text: 'reposted your post',
    timestamp: '15m',
    icon: 'repeat',
    iconColor: '#00BA7C',
  },
  {
    id: '3',
    type: 'follow',
    user: { name: 'Sarah Connor', avatar_url: 'https://i.pravatar.cc/150?u=sarah' },
    text: 'followed you',
    timestamp: '1h',
    icon: 'person-add',
    iconColor: '#1D9BF0',
  },
  {
    id: '4',
    type: 'mention',
    user: { name: 'Jane Doe', avatar_url: 'https://i.pravatar.cc/150?u=jane' },
    text: 'mentioned you in a post',
    timestamp: '3h',
    icon: 'at',
    iconColor: '#1D9BF0',
  },
];

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const renderItem = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => (
    <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
      </View>
      <View style={styles.contentContainer}>
        <Avatar uri={item.user.avatar_url} size={32} />
        <View style={styles.textRow}>
          <Text style={[styles.text, { color: colors.text }]}>
            <Text style={styles.bold}>{item.user.name}</Text> {item.text}
          </Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{item.timestamp}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7, 8]}
          renderItem={() => <SkeletonRow />}
          keyExtractor={(item) => item.toString()}
        />
      ) : (
        <FlatList
          data={MOCK_NOTIFICATIONS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  textRow: {
    marginTop: Spacing.sm,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 13,
    marginTop: 4,
  },
});
