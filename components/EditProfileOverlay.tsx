import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Animated,
  Dimensions,
  useColorScheme,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const EditProfileOverlay = ({ onClose }: any) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [name, setName] = useState('Human Being');
  const [handle, setHandle] = useState('yourhandle');
  const [bio, setBio] = useState('Human. Thinker. Explorer. 🌿\nBuilding Veritas for a better social web.');
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true
    }).start(() => onClose());
  };

  return (
    <Animated.View style={[
      styles.overlay, 
      { backgroundColor: colors.background, transform: [{ translateX: slideAnim }] }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleClose}>
          <Text style={[styles.saveText, { color: colors.accent }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={handle}
                onChangeText={setHandle}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Bio</Text>
              <TextInput
                style={[styles.bioInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={bio}
                onChangeText={setBio}
                multiline
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginTop: 40 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  saveText: { fontSize: 17, fontWeight: '700' },
  closeButton: { padding: 4 },
  content: { paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginVertical: Spacing.xl },
  avatarContainer: { position: 'relative' },
  editAvatarIcon: { position: 'absolute', right: 0, bottom: 0, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'transparent' },
  form: { paddingHorizontal: Spacing.xl },
  inputGroup: { marginBottom: Spacing.xl },
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  input: { height: 54, borderRadius: 18, paddingHorizontal: Spacing.lg, fontSize: 16, borderWidth: 1 },
  bioInput: { minHeight: 120, borderRadius: 18, padding: Spacing.lg, fontSize: 16, borderWidth: 1 },
});
