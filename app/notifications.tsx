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
import { api } from '../lib/api';

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.notifications.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow': return { name: 'person-add', color: '#1D9BF0' };
      case 'like': return { name: 'heart', color: '#F4212E' };
      case 'comment': return { name: 'chatbubble', color: '#00BA7C' };
      default: return { name: 'notifications', color: '#1D9BF0' };
    }
  };

  const formatTimestamp = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);
    
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const renderItem = ({ item }: { item: any }) => {
    const iconConfig = getNotificationIcon(item.type);
    const actor = item.actor || { name: 'Someone', avatar_url: null };

    return (
      <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]}>
        <View style={styles.iconContainer}>
          <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
        </View>
        <View style={styles.contentContainer}>
          <Avatar uri={actor.avatar_url} size={32} />
          <View style={styles.textRow}>
            <Text style={[styles.text, { color: colors.text }]}>
              <Text style={styles.bold}>{actor.name}</Text> {
                item.type === 'follow' ? 'followed you' : 
                item.type === 'like' ? 'liked your post' : 
                item.type === 'comment' ? 'commented on your post' : 
                'sent you a notification'
              }
            </Text>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatTimestamp(item.created_at)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          data={notifications}
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
