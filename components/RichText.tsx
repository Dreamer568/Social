import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import { useColorScheme } from 'react-native';

interface RichTextProps {
  content: string;
  onPressTag?: (tag: string) => void;
  onPressHandle?: (handle: string) => void;
}

export const RichText = ({ content, onPressTag, onPressHandle }: RichTextProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();

  // Split content into words while preserving spaces
  const words = content.split(/(\s+)/);

  return (
    <Text style={[styles.text, { color: colors.text }]}>
      {words.map((word, index) => {
        if (word.startsWith('@') && word.length > 1) {
          const handle = word.substring(1).replace(/[^\w]/g, '');
          return (
            <Text 
              key={index} 
              style={{ color: colors.accent, fontWeight: '600' }}
              onPress={() => {
                if (onPressHandle) onPressHandle(handle);
                else router.push(`/user/${handle}` as any);
              }}
            >
              {word}
            </Text>
          );
        }
        
        if (word.startsWith('#') && word.length > 1) {
          const tag = word.substring(1).replace(/[^\w]/g, '');
          return (
            <Text 
              key={index} 
              style={{ color: colors.accent, fontWeight: '600' }}
              onPress={() => {
                if (onPressTag) onPressTag(tag);
                // Future: router.push(`/search?q=${tag}`);
              }}
            >
              {word}
            </Text>
          );
        }

        return <Text key={index}>{word}</Text>;
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});
