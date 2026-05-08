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
import { Colors, Spacing } from '../constants/theme';
import { api } from '../lib/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const getNotificationDetails = (type: string) => {
  switch (type) {
    case 'follow':
      return { text: 'followed you', icon: 'person-add', color: '#1D9BF0' };
    case 'like':
      return { text: 'liked your post', icon: 'heart', color: '#F4212E' };
    case 'mention':
      return { text: 'mentioned you in a post', icon: 'at', color: '#00BA7C' };
    default:
      return { text: 'interacted with you', icon: 'notifications', color: '#71767B' };
  }
};

export const NotificationsOverlay = ({ onClose }: any) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8
    }).start();

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

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true
    }).start(() => onClose());
  };

  const handleNotificationPress = (handle: string) => {
    handleClose();
    router.push(`/user/${handle}` as any);
  };

  return (
    <Animated.View style={[
      styles.overlay, 
      { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] }
    ]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={loadNotifications}>
          <Ionicons name="refresh" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const details = getNotificationDetails(item.type);
            return (
              <TouchableOpacity 
                style={[styles.row, { borderBottomColor: colors.border }]}
                onPress={() => handleNotificationPress(item.actor.handle)}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={details.icon as any} size={24} color={details.color} />
                </View>
                <View style={styles.contentContainer}>
                  <Avatar uri={item.actor.avatar_url} size={32} />
                  <View style={styles.textRow}>
                    <Text style={[styles.text, { color: colors.text }]}>
                      <Text style={styles.bold}>{item.actor.name}</Text> {details.text}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary + '33'} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No notifications yet
              </Text>
            </View>
          }
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1300 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, marginTop: 40 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  closeButton: { padding: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', padding: Spacing.lg, borderBottomWidth: 1 },
  iconContainer: { width: 40, alignItems: 'center', paddingTop: 4 },
  contentContainer: { flex: 1, marginLeft: Spacing.sm },
  textRow: { marginTop: Spacing.xs },
  text: { fontSize: 15, lineHeight: 20 },
  bold: { fontWeight: '700' },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '500' },
});
