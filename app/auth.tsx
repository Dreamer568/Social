import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  useColorScheme,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const handleAuth = async () => {
    if (!email || !password || (mode === 'signup' && !username)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username: username.toLowerCase().replace(/\s/g, ''),
              name: username
            }
          }
        });
        if (error) throw error;
        Alert.alert('Success', 'Account created! Welcome to Sync.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Auth Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: colors.accent }]}>
            <Ionicons name="infinite" size={40} color="white" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Sync</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {mode === 'login' ? 'Welcome back, friend.' : 'Join the human-first social network.'}
          </Text>
        </View>

        <View style={styles.form}>
          {mode === 'signup' && (
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Pick a Username"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login' ? 'Login' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchMode}
            onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <Text style={{ color: colors.accent, fontWeight: '700' }}>
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl },
  header: { alignItems: 'center', marginBottom: Spacing.xl * 2 },
  logo: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  title: { fontSize: 32, fontWeight: '900', marginBottom: Spacing.xs },
  subtitle: { fontSize: 16, textAlign: 'center', opacity: 0.8 },
  form: { width: '100%' },
  input: { height: 60, borderRadius: 20, paddingHorizontal: Spacing.lg, fontSize: 16, marginBottom: Spacing.md, borderWidth: 1 },
  button: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.md, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  switchMode: { marginTop: Spacing.xl, alignItems: 'center' },
  switchText: { fontSize: 14 },
});
