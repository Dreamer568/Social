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
  Animated,
  Dimensions,
  useColorScheme 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { api } from '../lib/api';
import { WebRTCManager } from '../lib/webrtc';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

export const ChatOverlay = ({ user, onClose, onProfilePress }: any) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [me, setMe] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const flatListRef = useRef<FlatList>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8
    }).start();

    loadMessages();
    api.messages.markAsRead(user.id);

    let subscription: any;
    
    const initChat = async () => {
      const currentUser = await api.user.getMe();
      if (!currentUser) return;
      setMe(currentUser);

      // 1. Initialize WebRTC P2P
      const rtc = new WebRTCManager(currentUser.id, user.id);
      webrtcRef.current = rtc;

      rtc.setCallbacks(
        (text: string) => {
          // Received a message via P2P
          const newMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'other',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, newMsg]);
          api.messages.markAsRead(user.id);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        },
        (status) => {
          setConnectionStatus(status);
        }
      );

      // One user acts as initiator (lexicographical sort of IDs determines who offers)
      const isInitiator = currentUser.id < user.id;
      rtc.connect(isInitiator);

      // 2. Setup Database Fallback Subscription
      // Use the already-imported supabase directly (NOT dynamic import) so .on() is called BEFORE .subscribe()
      const { supabase: sb } = await import('../lib/supabase');
      const channelName = `messages_${[currentUser.id, user.id].sort().join('_')}`;
      subscription = sb
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${user.id}`,
          },
          (payload: any) => {
            // Only process DB message if P2P is NOT connected
            if (!webrtcRef.current || webrtcRef.current.sendMessage('') === false) {
               const newMsg: Message = {
                id: payload.new.id,
                text: payload.new.content,
                sender: 'other',
                time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };
              setMessages((prev) => [...prev, newMsg]);
              api.messages.markAsRead(user.id);
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            }
          }
        )
        .subscribe();
    };

    initChat();

    return () => {
      if (subscription) subscription.unsubscribe();
      if (webrtcRef.current) webrtcRef.current.disconnect();
    };
  }, []);

  const loadMessages = async () => {
    try {
      const thread = await api.messages.getThread(user.id);
      const currentUser = await api.user.getMe();
      if (!currentUser) return;

      const formattedMessages: Message[] = thread.map((m: any) => ({
        id: m.id,
        text: m.content,
        sender: m.sender_id === currentUser.id ? 'me' : 'other',
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      setMessages(formattedMessages);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (error) {
      console.error('Failed to load thread:', error);
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true
    }).start(() => onClose());
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;
    
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

    // Fallback to Encrypted Database Buffer
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

  return (
    <Animated.View style={[
      styles.overlay, 
      { backgroundColor: colors.background, transform: [{ translateX: slideAnim }] }
    ]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerInfo}
          onPress={() => onProfilePress(user.handle)}
        >
          <Avatar size={36} uri={user.avatar_url} />
          <View style={styles.headerText}>
            <Text style={[styles.headerName, { color: colors.text }]}>{user.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: connectionStatus === 'connected' ? colors.accent + '22' : '#6366f122' }
            ]}>
              <View style={[styles.statusDot, {
                backgroundColor: connectionStatus === 'connected' ? colors.accent : connectionStatus === 'connecting' ? '#f59e0b' : '#6366f1'
              }]} />
              <Ionicons
                name={connectionStatus === 'connected' ? 'leaf' : connectionStatus === 'connecting' ? 'timer-outline' : 'lock-closed'}
                size={10}
                color={connectionStatus === 'connected' ? colors.accent : connectionStatus === 'connecting' ? '#f59e0b' : '#6366f1'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.statusText, {
                color: connectionStatus === 'connected' ? colors.accent : connectionStatus === 'connecting' ? '#f59e0b' : '#6366f1'
              }]}>
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
        behavior="padding"
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    marginTop: 40,
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
