import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  useColorScheme 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

const MOCK_CHAT: Message[] = [
  { id: '1', text: 'Hey! Did you see the new Veritas update?', sender: 'other', time: '10:00 AM' },
  { id: '2', text: 'Yeah, the liquid navigation is so smooth!', sender: 'me', time: '10:02 AM' },
  { id: '3', text: 'Exactly! It feels much more human than the old UI.', sender: 'other', time: '10:03 AM' },
  { id: '4', text: 'I agree. No more Twitter vibes.', sender: 'me', time: '10:05 AM' },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [messages, setMessages] = useState<Message[]>(MOCK_CHAT);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

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
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
        <View 
          style={[
            styles.messageBubble, 
            isMe 
              ? { backgroundColor: colors.accent, borderBottomRightRadius: 4 } 
              : { backgroundColor: colors.surface, borderBottomLeftRadius: 4 }
          ]}
        >
          <Text style={[styles.messageText, { color: isMe ? 'white' : colors.text }]}>
            {item.text}
          </Text>
        </View>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Avatar size={36} uri="https://i.pravatar.cc/150?u=other" />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text }]}>David Miller</Text>
          <Text style={[styles.headerStatus, { color: colors.accent }]}>Online</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
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
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: Spacing.xs,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerAction: {
    padding: 8,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  messageWrapper: {
    marginBottom: Spacing.lg,
    maxWidth: '80%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  attachButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
