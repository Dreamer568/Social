import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { PostCard } from '../../components/PostCard';
import { SkeletonPost } from '../../components/SkeletonPost';
import { Spacing } from '../../constants/theme';
import { SCREEN_WIDTH } from './constants';

export const HomeSection = ({ loading, colors, router, feedType, setFeedType, colorScheme, posts, onNotificationPress, onSearchPress }: any) => {
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomWidth: 0 }]}>
      <TouchableOpacity 
        style={[styles.circleButton, { backgroundColor: colors.surface, borderColor: colors.border }]} 
        onPress={onSearchPress}
      >
        <Ionicons name="search" size={22} color={colors.text} />
      </TouchableOpacity>
      
      <View style={[styles.headerToggleContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
        <TouchableOpacity 
          style={[
            styles.headerToggleButton, 
            feedType === 'World' && { 
              backgroundColor: colorScheme === 'dark' ? '#2F3336' : '#E1E8ED',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }
          ]}
          onPress={() => setFeedType('World')}
        >
          <Text style={[styles.headerToggleText, { color: feedType === 'World' ? colors.text : colors.textSecondary }]}>World</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.headerToggleButton, 
            feedType === 'Friends' && { 
              backgroundColor: colorScheme === 'dark' ? '#2F3336' : '#E1E8ED',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }
          ]}
          onPress={() => setFeedType('Friends')}
        >
          <Text style={[styles.headerToggleText, { color: feedType === 'Friends' ? colors.text : colors.textSecondary }]}>Friends</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.circleButton, { backgroundColor: colors.surface, borderColor: colors.border }]} 
        onPress={onNotificationPress}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.sectionContainer, { width: SCREEN_WIDTH }]}>
      {renderHeader()}
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={() => <SkeletonPost />}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostCard {...item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerToggleContainer: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 20,
    width: 160,
  },
  headerToggleButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerToggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
