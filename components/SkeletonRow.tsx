import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Shimmer } from './Shimmer';
import { Colors, Spacing } from '../constants/theme';

export const SkeletonRow: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <Shimmer width={50} height={50} borderRadius={25} />
      <View style={styles.textContainer}>
        <View style={styles.topRow}>
          <Shimmer width="40%" height={16} />
          <Shimmer width="15%" height={12} />
        </View>
        <Shimmer width="80%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
