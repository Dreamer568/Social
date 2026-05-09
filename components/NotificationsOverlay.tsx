import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  useColorScheme 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { SkeletonRow } from './SkeletonRow';
import { Colors, Spacing } from '../constants/theme';
import { api } from '../lib/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const NotificationsOverlay = ({ onClose }: any) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
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

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true
    }).start(() => onClose());
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
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <SkeletonRow />}
          keyExtractor={(item) => item.toString()}
        />
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }) => {
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
          }}
          keyExtractor={(item) => item.id}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    marginTop: 40,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  closeButton: { padding: 4 },
  row: { flexDirection: 'row', padding: Spacing.lg, borderBottomWidth: 1 },
  iconContainer: { width: 40, alignItems: 'center' },
  contentContainer: { flex: 1, marginLeft: Spacing.sm },
  textRow: { marginTop: Spacing.sm },
  text: { fontSize: 15, lineHeight: 20 },
  bold: { fontWeight: '700' },
  timestamp: { fontSize: 13, marginTop: 4 },
});
