import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Platform,
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Shimmer } from '../components/Shimmer';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  useEffect(() => {
    // Focus search input on mount
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  const renderTrendingItem = () => (
    <View style={styles.trendingItem}>
      <Shimmer width="20%" height={12} style={{ marginBottom: 4 }} />
      <Shimmer width="60%" height={16} style={{ marginBottom: 4 }} />
      <Shimmer width="15%" height={12} />
    </View>
  );

  const renderPersonItem = () => (
    <View style={styles.personItem}>
      <Shimmer width={40} height={40} borderRadius={20} />
      <View style={styles.personText}>
        <Shimmer width="50%" height={14} style={{ marginBottom: 4 }} />
        <Shimmer width="30%" height={12} />
      </View>
      <Shimmer width={70} height={30} borderRadius={15} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text }]}
            placeholder="Search Veritas"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <FlatList
        data={[1]}
        renderItem={() => (
          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending for you</Text>
            {[1, 2, 3, 4].map((i) => (
              <View key={`trending-${i}`} style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
                {renderTrendingItem()}
              </View>
            ))}

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.xl }]}>Who to follow</Text>
            {[1, 2, 3].map((i) => (
              <View key={`person-${i}`} style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
                {renderPersonItem()}
              </View>
            ))}
          </View>
        )}
        keyExtractor={() => 'search-content'}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  content: {
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  itemContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  trendingItem: {
    paddingVertical: Spacing.xs,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
