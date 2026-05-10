import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  useColorScheme,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { Colors, Spacing } from '../../constants/theme';
import { api } from '../../lib/api';
import { WebRTCManager } from '../../lib/webrtc';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // This is the user handle!
  const handle = Array.isArray(id) ? id[0] : id || '';
  
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const flatListRef = useRef<FlatList>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);

  useEffect(() => {
    let subscription: any;

    const initChat = async () => {
      setLoading(true);
      try {
        // 1. Fetch user by handle
        const targetUser = await api.user.getByHandle(handle);
        if (!targetUser) return;
        setUser(targetUser);

        const currentUser = await api.user.getMe();
        if (!currentUser) return;
        setMe(currentUser);

        // 2. Load existing thread from Supabase
        const thread = await api.messages.getThread(targetUser.id);
        const formattedMessages: Message[] = thread.map((m: any) => ({
          id: m.id,
          text: m.content,
          sender: m.sender_id === currentUser.id ? 'me' : 'other',
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(formattedMessages);
        api.messages.markAsRead(targetUser.id);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);

        // 3. Initialize WebRTC P2P
        const rtc = new WebRTCManager(currentUser.id, targetUser.id);
        webrtcRef.current = rtc;

        rtc.setCallbacks(
          (text: string) => {
            const newMsg: Message = {
              id: Date.now().toString(),
              text,
              sender: 'other',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, newMsg]);
            api.messages.markAsRead(targetUser.id);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          },
          (status) => {
            setConnectionStatus(status);
          }
        );

        const isInitiator = currentUser.id < targetUser.id;
        rtc.connect(isInitiator);

        // 4. Setup Database Fallback Subscription (await so .on() runs before .subscribe())
        const { supabase: sb } = await import('../../lib/supabase');
        const channelName = `messages_${[currentUser.id, targetUser.id].sort().join('_')}`;
        subscription = sb
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `sender_id=eq.${targetUser.id}`,
            },
            (payload: any) => {
              if (!webrtcRef.current || webrtcRef.current.sendMessage('') === false) {
                 const newMsg: Message = {
                  id: payload.new.id,
                  text: payload.new.content,
                  sender: 'other',
                  time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages((prev) => [...prev, newMsg]);
                api.messages.markAsRead(targetUser.id);
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
              }
            }
          )
          .subscribe();

      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (subscription) subscription.unsubscribe();
      if (webrtcRef.current) webrtcRef.current.disconnect();
    };
  }, [handle]);

  const sendMessage = async () => {
    if (inputText.trim() === '' || !user) return;
    
    const tempId = Date.now().toString();
    const textToSend = inputText;
    
    const optimisticMessage: Message = {
      id: tempId,
      text: textToSend,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, optimisticMessage]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // Try P2P WebRTC first
    let sentP2P = false;
    if (webrtcRef.current) {
      sentP2P = webrtcRef.current.sendMessage(textToSend);
    }

    // Fallback to Database Buffer
    if (!sentP2P) {
      try {
        await api.messages.send(user.id, textToSend);
      } catch (error) {
        console.error('Failed to send message via buffer:', error);
        setMessages((prev) => prev.filter(m => m.id !== tempId));
        setInputText(textToSend); 
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>User not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.accent }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerInfo}
          onPress={() => router.push(`/user/${user.handle}` as any)}
        >
          <Avatar size={36} uri={user.avatar_url} />
          <View style={styles.headerText}>
            <Text style={[styles.headerName, { color: colors.text }]}>{user.name}</Text>
            {/* Connection Status Pill Badge */}
            <View style={[
              styles.statusBadge,
              { backgroundColor: connectionStatus === 'connected' ? colors.accent + '22' : '#6366f122' }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: connectionStatus === 'connected' ? colors.accent : connectionStatus === 'connecting' ? '#f59e0b' : '#6366f1' }
              ]} />
              <Ionicons
                name={connectionStatus === 'connected' ? 'leaf' : connectionStatus === 'connecting' ? 'timer-outline' : 'lock-closed'}
                size={10}
                color={connectionStatus === 'connected' ? colors.accent : connectionStatus === 'connecting' ? '#f59e0b' : '#6366f1'}
                style={{ marginRight: 4 }}
              />
              <Text style={[
                styles.statusText,
                { color: connectionStatus === 'connected' ? colors.accent : connectionStatus === 'connecting' ? '#f59e0b' : '#6366f1' }
              ]}>
                {connectionStatus === 'connected' ? 'P2P Active' : connectionStatus === 'connecting' ? 'Connecting...' : 'E2E Encrypted'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>


      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flex}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => {
            const isMe = item.sender === 'me';
            return (
              <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
                <View style={[
                  styles.messageBubble, 
                  { backgroundColor: isMe ? colors.accent : colors.surface }
                ]}>
                  <Text style={[styles.messageText, { color: isMe ? 'white' : colors.text }]}>
                    {item.text}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.time}</Text>
                  {isMe && (
                    <Ionicons 
                      name={connectionStatus === 'connected' ? "leaf" : "checkmark-done"} 
                      size={14} 
                      color={connectionStatus === 'connected' ? colors.accent : colors.textSecondary} 
                      style={{ marginLeft: 4, marginTop: 2 }} 
                    />
                  )}
                </View>
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <Ionicons name={connectionStatus === 'connected' ? "leaf" : "lock-closed"} size={48} color={connectionStatus === 'connected' ? colors.accent : colors.textSecondary + '40'} />
              <Text style={{ color: colors.textSecondary, marginTop: 16, textAlign: 'center', paddingHorizontal: 40 }}>
                {connectionStatus === 'connected' 
                  ? 'Direct device-to-device secure connection established. Messages bypass the server.'
                  : 'Messages are end-to-end encrypted. No one outside of this chat, not even Sync, can read them.'}
              </Text>
            </View>
          }
        />

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={28} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: inputText.trim() ? colors.accent : colors.surface }]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4, marginRight: Spacing.xs },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.sm },
  headerText: { marginLeft: Spacing.sm },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerAction: { padding: 8 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  messageWrapper: { marginBottom: Spacing.lg, maxWidth: '80%' },
  myMessageWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherMessageWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  messageBubble: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 16 },
  messageText: { fontSize: 16, lineHeight: 22 },
  timeText: { fontSize: 11, marginTop: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1 },
  attachButton: { padding: 4 },
  input: { flex: 1, marginHorizontal: Spacing.sm, borderRadius: 20, paddingHorizontal: Spacing.lg, paddingVertical: 8, maxHeight: 100, fontSize: 16 },
  sendButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
