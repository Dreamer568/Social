import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Platform,
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { SkeletonPost } from '../../components/SkeletonPost';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('Posts');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const stats = [
    { label: 'Posts', value: '42' },
    { label: 'Followers', value: '1.2k' },
    { label: 'Following', value: '380' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View style={[styles.coverPhoto, { backgroundColor: colors.surface }]} />
        
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarOutline, { backgroundColor: colors.background }]}>
              <Avatar size={80} uri="https://i.pravatar.cc/150?u=me" />
            </View>
            <TouchableOpacity style={[styles.editButton, { borderColor: colors.border }]}>
              <Text style={[styles.editButtonText, { color: colors.text }]}>Edit profile</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.name, { color: colors.text }]}>John Doe</Text>
          <Text style={[styles.handle, { color: colors.textSecondary }]}>@johndoe</Text>
          
          <Text style={[styles.bio, { color: colors.text }]}>
            Just a human exploring the digital world. No AI, just vibes. 🌍✨
          </Text>
          
          <View style={styles.statsRow}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Profile Tabs */}
        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          {['Posts', 'Media', 'Likes'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[
                styles.tab, 
                activeTab === tab && { borderBottomColor: colors.accent, borderBottomWidth: 3 }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text 
                style={[
                  styles.tabText, 
                  { color: activeTab === tab ? colors.text : colors.textSecondary, fontWeight: activeTab === tab ? '700' : '500' }
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          {[1, 2, 3].map((i) => (
            <SkeletonPost key={i} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverPhoto: {
    width: '100%',
    height: 120,
  },
  profileInfo: {
    paddingHorizontal: Spacing.lg,
    marginTop: -40,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  avatarOutline: {
    padding: 4,
    borderRadius: 44,
  },
  editButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: 4,
  },
  editButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
  },
  handle: {
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  bio: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    marginRight: Spacing.lg,
  },
  statValue: {
    fontWeight: '700',
    fontSize: 14,
    marginRight: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  tabText: {
    fontSize: 15,
  },
  content: {
    paddingBottom: 120,
  },
});
