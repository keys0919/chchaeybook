import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChildColors, Spacing, Radius, ComponentSize, Shadow } from '../../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../../src/design/typography';
import { useProfileStore } from '../../../src/stores/profile.store';
import { useSessionStore } from '../../../src/stores/session.store';
import { getRecentBooks } from '../../../src/services/record.service';

export default function BookInputScreen() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { startSession } = useSessionStore();

  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [recentBooks, setRecentBooks] = useState<string[]>([]);
  const titleRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!profile) return;
    getRecentBooks(profile.child_id).then(setRecentBooks).catch(() => {});
  }, [profile]);

  const handleStart = () => {
    if (!bookTitle.trim() || !profile) return;
    startSession(bookTitle.trim(), author.trim() || null, profile.current_level);
    router.push('/write/card');
  };

  const handleSelectRecent = (title: string) => {
    setBookTitle(title);
    titleRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>어떤 책을 읽었어요?</Text>
          <View style={{ height: Spacing.lg }} />

          <Text style={styles.label}>책 제목</Text>
          <TextInput
            ref={titleRef}
            style={styles.input}
            value={bookTitle}
            onChangeText={setBookTitle}
            placeholder="책 제목을 입력해주세요"
            placeholderTextColor={ChildColors.textTertiary}
            autoFocus
            returnKeyType="next"
          />

          <View style={{ height: Spacing.md }} />

          <Text style={styles.label}>작가 <Text style={styles.optional}>(선택)</Text></Text>
          <TextInput
            style={styles.input}
            value={author}
            onChangeText={setAuthor}
            placeholder="작가 이름을 입력해주세요"
            placeholderTextColor={ChildColors.textTertiary}
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />

          {recentBooks.length > 0 && (
            <View style={{ marginTop: Spacing.lg }}>
              <Text style={styles.recentLabel}>최근에 읽은 책</Text>
              <View style={{ height: Spacing.sm }} />
              {recentBooks.map((title) => (
                <TouchableOpacity
                  key={title}
                  style={styles.recentItem}
                  onPress={() => handleSelectRecent(title)}
                >
                  <Text style={styles.recentItemText} numberOfLines={1}>{title}</Text>
                  <Text style={styles.recentItemArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.ctaArea}>
          <TouchableOpacity
            style={[styles.primaryBtn, !bookTitle.trim() && styles.primaryBtnDisabled]}
            onPress={handleStart}
            disabled={!bookTitle.trim()}
          >
            <Text style={styles.primaryBtnText}>카드 받기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing['2xl'], paddingTop: Spacing.lg },
  heading: { ...TextStyle.heading1, color: ChildColors.textPrimary },
  label: { ...TextStyle.label, color: ChildColors.textPrimary, marginBottom: Spacing.xs },
  optional: { ...TextStyle.caption, color: ChildColors.textTertiary },
  input: {
    height: ComponentSize.inputHeight,
    borderWidth: 1,
    borderColor: ChildColors.divider,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    ...TextStyle.body,
    color: ChildColors.textPrimary,
    backgroundColor: ChildColors.surface1,
  },
  recentLabel: { ...TextStyle.caption, color: ChildColors.textSecondary },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
    ...Shadow.level1,
    shadowColor: '#1A1A1A',
  },
  recentItemText: { ...TextStyle.body, color: ChildColors.textPrimary, flex: 1 },
  recentItemArrow: { ...TextStyle.body, color: ChildColors.textTertiary, marginLeft: Spacing.sm },
  ctaArea: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: ChildColors.divider,
    backgroundColor: ChildColors.background,
  },
  primaryBtn: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.38 },
  primaryBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
});
