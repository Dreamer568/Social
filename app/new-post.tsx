import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Avatar } from '../components/Avatar';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

export default function NewPostScreen() {
  const [content, setContent] = useState('');
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const MAX_CHARS = 280;

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  const handlePost = () => {
    if (content.trim().length > 0 && content.length <= MAX_CHARS) {
      // Logic for posting
      router.back();
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.postButton, 
            { backgroundColor: colors.accent, opacity: content.trim().length > 0 && !isOverLimit ? 1 : 0.5 }
          ]}
          onPress={handlePost}
          disabled={content.trim().length === 0 || isOverLimit}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.inputArea}>
          <Avatar size={40} uri="https://i.pravatar.cc/150?u=me" />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text }]}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textSecondary}
            multiline
            value={content}
            onChangeText={setContent}
          />
        </View>

        <View style={[styles.toolbar, { borderTopColor: colors.border }]}>
          <View style={styles.toolbarIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="image-outline" size={24} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="mic-outline" size={24} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="location-outline" size={24} color={colors.accent} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.countContainer}>
            <Text style={[styles.countText, { color: isOverLimit ? colors.error : colors.textSecondary }]}>
              {charCount}/{MAX_CHARS}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  postButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  postButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  inputArea: {
    flexDirection: 'row',
    padding: Spacing.lg,
    flex: 1,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 18,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  toolbarIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: Spacing.sm,
  },
  countContainer: {
    paddingRight: Spacing.md,
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
