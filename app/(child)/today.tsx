// D-1 아이 홈 — S1(신규) / S2(이어쓰기 1개) / S3(이어쓰기 2개↑)
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  ChildColors,
  Spacing,
  Radius,
  ComponentSize,
  Shadow,
  CopyTokens,
} from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';
import { useAuthStore } from '../../src/stores/auth.store';
import { useSessionStore } from '../../src/stores/session.store';
import { usePraiseStore } from '../../src/stores/praise.store';
import { loadMeaningfulDrafts } from '../../src/services/draft.service';
import type { Draft } from '../../src/types/db.types';

function draftExpiryLabel(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return CopyTokens.DRAFT_EXPIRE.replace('{n}', String(days));
}

export default function TodayScreen() {
  const router = useRouter();
  const { childProfile } = useAuthStore();
  const { startSession } = useSessionStore();
  const { unseenCount } = usePraiseStore();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDrafts = useCallback(async () => {
    if (!childProfile) return;
    setLoading(true);
    try {
      const result = await loadMeaningfulDrafts(childProfile.child_id);
      setDrafts(result);
    } catch {
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, [childProfile]);

  useFocusEffect(
    useCallback(() => {
      loadDrafts();
    }, [loadDrafts])
  );

  const handleNewBook = () => {
    router.push('/write/book-input');
  };

  const handleResume = (draft: Draft) => {
    startSession(draft.book_title, null, draft.level, 1, draft.draft_id);
    router.push('/write/card');
  };

  if (!childProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color={ChildColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* S2: 칭찬 도착 배너 */}
      {unseenCount > 0 ? (
        <TouchableOpacity style={styles.praiseBanner} onPress={() => router.push('/stamps')}>
          <Text style={styles.praiseBannerText}>🎉 부모님 칭찬이 도착했어요!</Text>
        </TouchableOpacity>
      ) : null}
      <ScrollView contentContainerStyle={styles.content}>
        {/* 인사 */}
        <Text style={styles.greeting}>안녕하세요, {childProfile.nickname}!</Text>
        <Text style={styles.subGreeting}>오늘도 한 문장 써볼까요?</Text>

        <View style={{ height: Spacing.xl }} />

        {loading ? (
          <ActivityIndicator color={ChildColors.primary} />
        ) : drafts.length === 0 ? (
          // S1: 신규
          <View style={styles.emptyArea}>
            <Text style={styles.emptyEmoji}>📖</Text>
            <Text style={styles.emptyText}>{CopyTokens.EMPTY_CHILD_HOME}</Text>
          </View>
        ) : (
          // S2 / S3: 이어쓰기
          <View>
            <Text style={styles.sectionLabel}>이어서 쓰기</Text>
            <View style={{ height: Spacing.sm }} />
            {drafts.map((draft) => (
              <TouchableOpacity
                key={draft.draft_id}
                style={styles.resumeCard}
                onPress={() => handleResume(draft)}
              >
                <View style={styles.resumeCardInner}>
                  <Text style={styles.resumeBookTitle} numberOfLines={1}>
                    {draft.book_title}
                  </Text>
                  <Text style={styles.resumeExpiry}>{draftExpiryLabel(draft.expires_at)}</Text>
                </View>
                <Text style={styles.resumeArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: Spacing.xl }} />

        {/* 새 책 시작 — 항상 노출 */}
        <TouchableOpacity style={styles.newBookBtn} onPress={handleNewBook}>
          <Text style={styles.newBookBtnText}>+ 새 책 시작하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  praiseBanner: {
    backgroundColor: ChildColors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing['2xl'],
    alignItems: 'center',
  },
  praiseBannerText: { ...TextStyle.label, color: ChildColors.textOnPrimary },
  content: { padding: Spacing['2xl'], paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  greeting: { ...TextStyle.heading1, color: ChildColors.textPrimary },
  subGreeting: { ...TextStyle.body, color: ChildColors.textSecondary, marginTop: Spacing.xs },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyArea: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyText: { ...TextStyle.body, color: ChildColors.textSecondary, textAlign: 'center' },
  sectionLabel: { ...TextStyle.label, color: ChildColors.textSecondary },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.level1,
    shadowColor: '#000',
  },
  resumeCardInner: { flex: 1 },
  resumeBookTitle: { ...TextStyle.body, color: ChildColors.textPrimary, fontWeight: '600' },
  resumeExpiry: { ...TextStyle.caption, color: ChildColors.textTertiary, marginTop: 2 },
  resumeArrow: { ...TextStyle.heading1, color: ChildColors.textTertiary, marginLeft: Spacing.sm },
  newBookBtn: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBookBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
});
