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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

const MOCK_CHAT: Message[] = [
  { id: '1', text: 'Hey! Did you see the new Sync update?', sender: 'other', time: '10:00 AM' },
  { id: '2', text: 'Yeah, the liquid navigation is so smooth!', sender: 'me', time: '10:02 AM' },
  { id: '3', text: 'Exactly! It feels much more human than the old UI.', sender: 'other', time: '10:03 AM' },
  { id: '4', text: 'I agree. No more Twitter vibes.', sender: 'me', time: '10:05 AM' },
];

export const ChatOverlay = ({ user, onClose, onProfilePress }: any) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [messages, setMessages] = useState<Message[]>(MOCK_CHAT);
  const [inputText, setInputText] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const flatListRef = useRef<FlatList>(null);

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

  const sendMessage = () => {
    if (inputText.trim() === '') return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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
            <Text style={[styles.headerStatus, { color: colors.accent }]}>Online</Text>
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
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.time}</Text>
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    marginTop: 40, // Adjust for safe area if needed
  },
  backButton: { padding: 4, marginRight: Spacing.xs },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.sm },
  headerText: { marginLeft: Spacing.sm },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerStatus: { fontSize: 12, fontWeight: '500' },
  headerAction: { padding: 8 },
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
