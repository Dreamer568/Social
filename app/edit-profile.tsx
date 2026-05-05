import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  useColorScheme,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/Avatar';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [name, setName] = useState('Human Being');
  const [handle, setHandle] = useState('yourhandle');
  const [bio, setBio] = useState('Human. Thinker. Explorer. 🌿\nBuilding Veritas for a better social web.');

  const handleSave = () => {
    // In a real app, we would save to Supabase here
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveText, { color: colors.accent }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Avatar size={100} uri="https://i.pravatar.cc/150?u=me" />
              <TouchableOpacity style={[styles.editAvatarIcon, { backgroundColor: colors.accent }]}>
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={{ color: colors.accent, fontWeight: '600' }}>Change Profile Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
              <View style={styles.handleInputContainer}>
                <Text style={[styles.handlePrefix, { color: colors.textSecondary }]}>@</Text>
                <TextInput
                  style={[styles.handleInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  value={handle}
                  onChangeText={setHandle}
                  placeholder="username"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Bio</Text>
              <TextInput
                style={[styles.bioInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Write a short bio"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  editAvatarIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent', // Will be set by parent background
  },
  changePhotoButton: {
    padding: 8,
  },
  form: {
    paddingHorizontal: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  input: {
    height: 54,
    borderRadius: 18,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  handleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handlePrefix: {
    position: 'absolute',
    left: Spacing.lg,
    zIndex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  handleInput: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    paddingLeft: 34,
    paddingRight: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  bioInput: {
    minHeight: 120,
    borderRadius: 18,
    padding: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    lineHeight: 22,
  },
});
