import React from 'react';
import { View, Image, StyleSheet, useColorScheme } from 'react-native';
import { Colors, BorderRadius } from '../constants/theme';

interface AvatarProps {
  uri?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, size = 40 }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor: colors.skeleton 
        }
      ]}
    >
      {uri ? (
        <Image 
          source={{ uri }} 
          style={{ width: size, height: size, borderRadius: size / 2 }} 
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
