import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Shimmer } from './Shimmer';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

export const SkeletonPost: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.header}>
        <Shimmer width={40} height={40} borderRadius={20} />
        <View style={styles.headerText}>
          <Shimmer width="40%" height={14} style={{ marginBottom: 4 }} />
          <Shimmer width="25%" height={12} />
        </View>
      </View>
      
      <View style={styles.content}>
        <Shimmer width="90%" height={14} style={{ marginBottom: 8 }} />
        <Shimmer width="95%" height={14} style={{ marginBottom: 8 }} />
        <Shimmer width="60%" height={14} style={{ marginBottom: 16 }} />
        
        <Shimmer width="100%" height={200} borderRadius={BorderRadius.lg} style={{ marginBottom: 16 }} />
      </View>
      
      <View style={styles.actions}>
        <Shimmer width={60} height={20} borderRadius={10} />
        <Shimmer width={60} height={20} borderRadius={10} />
        <Shimmer width={60} height={20} borderRadius={10} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  headerText: {
    marginLeft: Spacing.md,
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    marginLeft: 0,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
});
