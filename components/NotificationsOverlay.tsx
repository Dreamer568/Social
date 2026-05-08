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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'like', user: { name: 'Jane Doe', avatar_url: 'https://i.pravatar.cc/150?u=jane' }, text: 'liked your post', timestamp: '2m', icon: 'heart', iconColor: '#F4212E' },
  { id: '2', type: 'repost', user: { name: 'Alex Smith', avatar_url: 'https://i.pravatar.cc/150?u=alex' }, text: 'reposted your post', timestamp: '15m', icon: 'repeat', iconColor: '#00BA7C' },
  { id: '3', type: 'follow', user: { name: 'Sarah Connor', avatar_url: 'https://i.pravatar.cc/150?u=sarah' }, text: 'followed you', timestamp: '1h', icon: 'person-add', iconColor: '#1D9BF0' },
];

export const NotificationsOverlay = ({ onClose }: any) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8
    }).start();

    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
          data={MOCK_NOTIFICATIONS}
          renderItem={({ item }) => (
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
          )}
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
