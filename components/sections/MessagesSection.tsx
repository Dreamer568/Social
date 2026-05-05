import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { 
  FlatList, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Modal, 
  Dimensions, 
  Pressable,
  Platform,
  ScrollView
} from 'react-native';
import { Avatar } from '../Avatar';
import { Spacing, BorderRadius } from '../../constants/theme';
import { SCREEN_WIDTH } from './constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MessagesSection = ({ colors, router, messages, blockedUsers, onPin, onRename, onBlock, onUnblock }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  
  // Modals visibility
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [isBlockedListVisible, setIsBlockedListVisible] = useState(false);
  
  const [newName, setNewName] = useState('');

  const filteredMessages = messages.filter((msg: any) => 
    msg.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openOptions = (chat: any) => {
    if (!chat) return;
    setSelectedChat(chat);
    setNewName(chat.user?.name || '');
    setIsOptionsVisible(true);
  };

  const handleRename = () => {
    if (selectedChat && newName.trim()) {
      onRename(selectedChat.id, newName);
      setIsRenameVisible(false);
      setIsOptionsVisible(false);
    }
  };

  const renderActionSheet = () => (
    <Modal
      visible={isOptionsVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsOptionsVisible(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setIsOptionsVisible(false)}>
        <View style={[styles.actionSheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.indicator, { backgroundColor: colors.border }]} />
          <Text style={[styles.actionSheetTitle, { color: colors.textSecondary }]}>
            {selectedChat?.user?.name || 'Chat Options'}
          </Text>
          
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => {
              if (selectedChat) {
                onPin(selectedChat.id);
                setIsOptionsVisible(false);
              }
            }}
          >
            <Ionicons name="pin" size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              {selectedChat?.isPinned ? 'Unpin Chat' : 'Pin to Top'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => setIsRenameVisible(true)}>
            <Ionicons name="pencil" size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Rename</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => {
              if (selectedChat) {
                onBlock(selectedChat.id);
                setIsOptionsVisible(false);
              }
            }}
          >
            <Ionicons name="ban" size={20} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Block User</Text>
          </TouchableOpacity>
        </View>
      </Pressable>

      {/* Nested Rename Modal */}
      <Modal visible={isRenameVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Rename Chat</Text>
            <TextInput
              style={[styles.dialogInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.dialogButtons}>
              <TouchableOpacity onPress={() => setIsRenameVisible(false)}>
                <Text style={[styles.dialogButton, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRename}>
                <Text style={[styles.dialogButton, { color: colors.accent, fontWeight: '700' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal visible={isSettingsVisible} animationType="slide">
      <SafeAreaView style={[styles.fullModal, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setIsSettingsVisible(false)}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Message Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.flex}>
          <TouchableOpacity style={styles.settingsItem} onPress={() => setIsBlockedListVisible(!isBlockedListVisible)}>
            <View style={styles.settingsItemMain}>
              <Ionicons name="ban-outline" size={24} color={colors.text} />
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Blocked Users</Text>
            </View>
            <Ionicons name={isBlockedListVisible ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {isBlockedListVisible && (
            <View style={[styles.blockedList, { backgroundColor: colors.surface }]}>
              {blockedUsers.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No blocked users</Text>
              ) : (
                blockedUsers.map((user: any) => (
                  <View key={user.id} style={styles.blockedUserRow}>
                    <Avatar size={40} uri={user.avatar_url} />
                    <Text style={[styles.blockedUserName, { color: colors.text }]}>{user.name}</Text>
                    <TouchableOpacity onPress={() => onUnblock(user.id)}>
                      <Text style={{ color: colors.accent, fontWeight: '600' }}>Unblock</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemMain}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Notifications</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemMain}>
              <Ionicons name="trash-outline" size={24} color={colors.error} />
              <Text style={[styles.settingsItemText, { color: colors.error }]}>Clear all chats</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={[styles.sectionContainer, { width: SCREEN_WIDTH }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomWidth: 0 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        <TouchableOpacity 
          style={[styles.circleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setIsSettingsVisible(true)}
        >
          <Ionicons name="settings-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          placeholder="Search direct messages"
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredMessages}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.messageRow}
            onPress={() => router.push(`/chat/${item.id}`)}
            onLongPress={() => openOptions(item)}
          >
            <View style={styles.messageAvatarContainer}>
              <Avatar size={56} uri={item.user.avatar_url} />
              {item.unread > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.accent }]} />
              )}
            </View>
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <View style={styles.row}>
                  {item.isPinned && <Ionicons name="pin" size={14} color={colors.accent} style={{ marginRight: 4 }} />}
                  <Text style={[styles.messageName, { color: colors.text }]}>{item.user.name}</Text>
                </View>
                <Text style={[styles.messageTime, { color: colors.textSecondary }]}>{item.time}</Text>
              </View>
              <Text
                style={[styles.messageText, { color: item.unread > 0 ? colors.text : colors.textSecondary, fontWeight: item.unread > 0 ? '700' : '400' }]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {renderActionSheet()}
      {renderSettingsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: 22,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  messageRow: {
    flexDirection: 'row',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  messageAvatarContainer: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#000',
  },
  messageContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  messageName: {
    fontWeight: '700',
    fontSize: 16,
  },
  messageTime: {
    fontSize: 13,
  },
  messageText: {
    fontSize: 14,
  },
  // Custom Action Sheet UI
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    padding: Spacing.xl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  actionSheetTitle: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: Spacing.xl,
    fontWeight: '600',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  actionText: {
    marginLeft: Spacing.lg,
    fontSize: 16,
    fontWeight: '500',
  },
  // Dialog/Rename UI
  dialog: {
    marginHorizontal: 40,
    borderRadius: 20,
    padding: Spacing.xl,
    marginTop: -200, // Center roughly
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.lg,
  },
  dialogInput: {
    borderRadius: 10,
    padding: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.xl,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dialogButton: {
    marginLeft: Spacing.xl,
    fontSize: 16,
  },
  // Settings Full Screen Modal
  fullModal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  settingsItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    marginLeft: Spacing.lg,
    fontSize: 16,
    fontWeight: '500',
  },
  blockedList: {
    marginHorizontal: Spacing.lg,
    borderRadius: 16,
    padding: Spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    padding: Spacing.lg,
  },
  blockedUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  blockedUserName: {
    flex: 1,
    marginLeft: Spacing.md,
    fontWeight: '600',
  },
});
import { SafeAreaView } from 'react-native-safe-area-context';
