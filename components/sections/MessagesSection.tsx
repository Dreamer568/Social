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
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MessagesSection = ({ colors, router, messages, blockedUsers, onPin, onRename, onBlock, onUnblock, onDelete, onChatPress }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  
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
            style={[styles.actionItem, { backgroundColor: colors.background + '88', borderRadius: 16 }]} 
            onPress={() => {
              if (selectedChat) {
                onPin(selectedChat.id);
                setIsOptionsVisible(false);
              }
            }}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.accent + '22' }]}>
              <Ionicons name="pin" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>
              {selectedChat?.isPinned ? 'Unpin Chat' : 'Pin to Top'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, { backgroundColor: colors.background + '88', borderRadius: 16, marginTop: 12 }]} 
            onPress={() => setIsRenameVisible(true)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.text + '11' }]}>
              <Ionicons name="pencil" size={20} color={colors.text} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Rename</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, { backgroundColor: colors.background + '88', borderRadius: 16, marginTop: 12 }]} 
            onPress={() => {
              if (selectedChat) {
                onBlock(selectedChat.id);
                setIsOptionsVisible(false);
              }
            }}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.error + '22' }]}>
              <Ionicons name="ban" size={20} color={colors.error} />
            </View>
            <Text style={[styles.actionText, { color: colors.error }]}>Block User</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, { backgroundColor: colors.background + '88', borderRadius: 16, marginTop: 12 }]} 
            onPress={() => {
              if (selectedChat) {
                onDelete(selectedChat.id);
                setIsOptionsVisible(false);
              }
            }}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.error + '11' }]}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </View>
            <Text style={[styles.actionText, { color: colors.error }]}>Delete Chat</Text>
          </TouchableOpacity>
        </View>
      </Pressable>

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
          <TouchableOpacity onPress={() => setIsSettingsVisible(false)} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={{ padding: Spacing.lg }}>
          <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={styles.settingsItem} 
              onPress={() => setIsBlockedListVisible(!isBlockedListVisible)}
            >
              <View style={styles.settingsItemMain}>
                <View style={[styles.settingsIcon, { backgroundColor: colors.error + '15' }]}>
                  <Ionicons name="ban-outline" size={22} color={colors.error} />
                </View>
                <Text style={[styles.settingsItemText, { color: colors.text }]}>Blocked Users</Text>
              </View>
              <Ionicons 
                name={isBlockedListVisible ? "chevron-up" : "chevron-forward"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>

            {isBlockedListVisible && (
              <View style={styles.blockedListContainer}>
                {blockedUsers.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No blocked users yet</Text>
                ) : (
                  blockedUsers.map((user: any) => (
                    <View key={user.id} style={styles.blockedUserRow}>
                      <Avatar size={44} uri={user.avatar_url} />
                      <View style={styles.blockedUserInfo}>
                        <Text style={[styles.blockedUserName, { color: colors.text }]}>{user.name}</Text>
                        <Text style={[styles.blockedUserHandle, { color: colors.textSecondary }]}>@{user.handle || user.name.toLowerCase().replace(' ', '')}</Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.unblockButton, { backgroundColor: colors.accent + '22' }]} 
                        onPress={() => onUnblock(user.id)}
                      >
                        <Text style={[styles.unblockText, { color: colors.accent }]}>Unblock</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>

          <View style={[styles.settingsCard, { backgroundColor: colors.surface, marginTop: Spacing.lg }]}>
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemMain}>
                <View style={[styles.settingsIcon, { backgroundColor: colors.accent + '15' }]}>
                  <Ionicons name="notifications-outline" size={22} color={colors.accent} />
                </View>
                <Text style={[styles.settingsItemText, { color: colors.text }]}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingsItem, { borderTopWidth: 1, borderTopColor: colors.border + '33' }]}>
              <View style={styles.settingsItemMain}>
                <View style={[styles.settingsIcon, { backgroundColor: '#6366f115' }]}>
                  <Ionicons name="lock-closed-outline" size={22} color="#6366f1" />
                </View>
                <Text style={[styles.settingsItemText, { color: colors.text }]}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
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
        renderItem={({ item }) => {
          const showBlueDot = item.unread > 0;
          const showGreenDot = item.isOnline;
          
          return (
            <TouchableOpacity
              style={styles.messageRow}
              onPress={() => onChatPress(item)}
              onLongPress={() => openOptions(item)}
            >
              <TouchableOpacity 
                style={styles.messageAvatarContainer}
                onPress={() => router.push(`/user/${item.user.handle}`)}
              >
                <Avatar size={56} uri={item.user.avatar_url} />
                {showGreenDot && !showBlueDot && (
                  <View style={[styles.onlineBadge, { backgroundColor: '#4ade80' }]} />
                )}
                {showBlueDot && (
                  <View style={[
                    styles.unreadBadge, 
                    { backgroundColor: colors.accent },
                    showGreenDot && { borderColor: '#4ade80', borderWidth: 2 }
                  ]} />
                )}
              </TouchableOpacity>
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
        );
      }}
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
    top: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#000',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
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
  // Custom UI elements
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    padding: Spacing.xl,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 50,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  actionSheetTitle: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: Spacing.xl,
    fontWeight: '600',
  },
  actionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  actionText: {
    marginLeft: Spacing.lg,
    fontSize: 17,
    fontWeight: '600',
  },
  dialog: {
    marginHorizontal: 30,
    borderRadius: 28,
    padding: Spacing.xl,
    marginTop: -200,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  dialogInput: {
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    fontSize: 17,
    marginBottom: Spacing.xl,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dialogButton: {
    paddingHorizontal: Spacing.xl,
    fontSize: 17,
  },
  fullModal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  settingsCard: {
    borderRadius: 28,
    overflow: 'hidden',
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  settingsItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    marginLeft: Spacing.lg,
    fontSize: 17,
    fontWeight: '600',
  },
  blockedListContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  blockedUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  blockedUserInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  blockedUserName: {
    fontSize: 16,
    fontWeight: '700',
  },
  blockedUserHandle: {
    fontSize: 13,
    marginTop: 2,
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  unblockText: {
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    padding: Spacing.xl,
    fontSize: 15,
  },
});
