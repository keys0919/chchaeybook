// D-4 완성 카드 + 도장 애니메이션 — ReadingRecord 저장 + [부모님께 보내기]
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import {
  ChildColors,
  Spacing,
  Radius,
  ComponentSize,
  Shadow,
  WarmShadow,
} from '../../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../../src/design/typography';
import { useSessionStore } from '../../../src/stores/session.store';
import { useAuthStore } from '../../../src/stores/auth.store';
import { usePraiseStore } from '../../../src/stores/praise.store';
import { createRecord } from '../../../src/services/record.service';
import { removeDraft } from '../../../src/services/draft.service';
import { savePhotoLocally, saveVoiceLocally, shareMediaToParent } from '../../../src/services/media.service';
import { sendPushToUser, scheduleLocalNotification } from '../../../src/services/notification.service';
import { useNotificationStore } from '../../../src/stores/notification.store';

const STAMP_EMOJI = ['⭐', '🌟', '🏅', '📚', '✨', '🎖', '🥇'];

function pickStamp(level: number, sessionIndex: number): string {
  const idx = (level - 1 + sessionIndex - 1) % STAMP_EMOJI.length;
  return STAMP_EMOJI[idx];
}

type ShareState = 'idle' | 'sharing' | 'done' | 'failed';

export default function CompleteScreen() {
  const router = useRouter();
  const { session, clearSession } = useSessionStore();
  const { childProfile } = useAuthStore();
  const { unseenCount } = usePraiseStore();

  const stampScale = useRef(new Animated.Value(0)).current;
  const stampOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const [saved, setSaved] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [savedMediaId, setSavedMediaId] = useState<string | null>(null);
  const [savedLocalPath, setSavedLocalPath] = useState<string | null>(null);
  const [shareState, setShareState] = useState<ShareState>('idle');

  const hasMedia = Boolean(session?.mediaTempUri && session?.mediaTempType);

  useEffect(() => {
    if (!session || !childProfile || saved) return;

    setSaved(true);
    const recordId = Crypto.randomUUID();
    setSavedRecordId(recordId);

    const stamp = pickStamp(session.level, session.sessionIndex);
    const now = new Date().toISOString();
    const record = {
      record_id: recordId,
      child_id: childProfile.child_id,
      book_title: session.bookTitle,
      author: session.author,
      read_date: now.slice(0, 10),
      level: session.level,
      card_id: session.card?.card_id ?? 'temp',
      sentences: session.sentences,
      selected_hints: session.selectedHints,
      sync_status: 'local' as const,
      badges: [stamp],
      session_index: session.sessionIndex,
      created_at: now,
      updated_at: now,
    };

    createRecord(record).then(() => {
      const { prefs } = useNotificationStore.getState();
      if (prefs.newRecord && childProfile.parent_id) {
        sendPushToUser(
          childProfile.parent_id,
          '새 독서 기록이 도착했어요 📚',
          `${childProfile.nickname}이(가) 책을 읽었어요. 확인해보세요!`,
          { screen: 'parent-record', recordId }
        ).catch(() => {});
      }
    }).catch(() => {});
    if (session.draftId) removeDraft(session.draftId).catch(() => {});

    // 미디어 로컬 저장
    if (session.mediaTempUri && session.mediaTempType) {
      const saveFn = session.mediaTempType === 'photo' ? savePhotoLocally : saveVoiceLocally;
      saveFn(session.mediaTempUri, childProfile.child_id, recordId)
        .then((item) => {
          setSavedMediaId(item.media_id);
          setSavedLocalPath(item.local_path);
        })
        .catch(() => {});
    }

    // 카드 fade-in
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      Animated.sequence([
        Animated.timing(stampOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.spring(stampScale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handleShare = async () => {
    if (!savedMediaId || !savedLocalPath || !savedRecordId || !childProfile) return;
    const parentId = childProfile.parent_id;
    if (!parentId) return;

    setShareState('sharing');
    try {
      await shareMediaToParent(
        savedMediaId,
        savedLocalPath,
        session!.mediaTempType!,
        savedRecordId,
        childProfile.child_id,
        parentId
      );
      setShareState('done');
      const { prefs } = useNotificationStore.getState();
      if (prefs.mediaShared) {
        const typeLabel = session!.mediaTempType === 'photo' ? '사진' : '녹음';
        sendPushToUser(
          parentId,
          `${typeLabel}을 보냈어요 ${session!.mediaTempType === 'photo' ? '📷' : '🎙'}`,
          `${childProfile.nickname}이(가) ${typeLabel}을 공유했어요!`,
          { screen: 'parent-record', recordId: savedRecordId }
        ).catch(() => {});
      }
    } catch {
      setShareState('failed');
    }
  };

  const handleWriteMore = () => {
    if (!session) return;
    const { bookTitle, author, level, sessionIndex } = session;
    clearSession();
    useSessionStore.getState().startSession(bookTitle, author, level, sessionIndex + 1);
    router.replace('/write/card');
  };

  const handleHome = () => {
    clearSession();
    router.replace('/today');
  };

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>완성된 기록이 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stamp = pickStamp(session.level, session.sessionIndex);

  return (
    <SafeAreaView style={styles.safeArea}>
      {unseenCount > 0 ? (
        <TouchableOpacity style={styles.praiseBanner} onPress={() => router.push('/stamps')}>
          <Text style={styles.praiseBannerText}>🎉 부모님 칭찬이 도착했어요!</Text>
        </TouchableOpacity>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[styles.completionCard, { opacity: cardOpacity }]}>
          <Text style={styles.bookTitle} numberOfLines={2}>{session.bookTitle}</Text>
          {session.author ? (
            <Text style={styles.bookAuthor}>{session.author}</Text>
          ) : null}

          <View style={styles.divider} />

          {session.sentences.length > 0 ? (
            session.sentences.map((s, i) => (
              <View key={i} style={styles.sentenceRow}>
                <Text style={styles.quoteBar} />
                <Text style={styles.sentenceText}>{s}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.mediaLabel}>
              {session.mediaTempType === 'photo' ? '📷 사진 기록' : '🎙 녹음 기록'}
            </Text>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.stampWrap,
            { opacity: stampOpacity, transform: [{ scale: stampScale }] },
          ]}
        >
          <View style={styles.stampCircle}>
            <Text style={styles.stampEmoji}>{stamp}</Text>
          </View>
          <Text style={styles.stampLabel}>도장 획득!</Text>
        </Animated.View>

        {/* 부모님께 보내기 */}
        {hasMedia ? (
          <View style={styles.shareSection}>
            {shareState === 'idle' ? (
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShare}
                disabled={!savedMediaId}
              >
                <Text style={styles.shareBtnText}>📤 부모님께 보내기</Text>
              </TouchableOpacity>
            ) : shareState === 'sharing' ? (
              <View style={styles.shareStatusRow}>
                <ActivityIndicator color={ChildColors.primary} size="small" />
                <Text style={styles.shareStatusText}>보내는 중...</Text>
              </View>
            ) : shareState === 'done' ? (
              <Text style={styles.shareDoneText}>✓ 부모님께 전달됐어요!</Text>
            ) : (
              <View style={styles.shareStatusRow}>
                <Text style={styles.shareFailText}>전송 실패</Text>
                <TouchableOpacity onPress={handleShare}>
                  <Text style={styles.retryText}>다시 시도</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleWriteMore}>
            <Text style={styles.primaryBtnText}>한 문장 더 쓰기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleHome}>
            <Text style={styles.secondaryBtnText}>홈으로</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  content: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  completionCard: {
    width: '100%',
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: ChildColors.primaryLight,
    ...(Platform.OS === 'ios' ? WarmShadow : { elevation: 3 }),
    marginTop: Spacing.lg,
  },
  bookTitle: { ...TextStyle.heading2, color: ChildColors.textPrimary, textAlign: 'center' },
  bookAuthor: {
    ...TextStyle.caption,
    color: ChildColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: ChildColors.divider,
    marginVertical: Spacing.md,
  },
  sentenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  quoteBar: {
    width: 3,
    backgroundColor: ChildColors.primary,
    borderRadius: 2,
    minHeight: 20,
    marginTop: 3,
  },
  sentenceText: { ...TextStyle.body, color: ChildColors.textPrimary, flex: 1, lineHeight: 26 },
  mediaLabel: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  stampWrap: { alignItems: 'center', marginTop: Spacing.xl, gap: Spacing.sm },
  stampCircle: {
    width: ComponentSize.stampBadgeLarge,
    height: ComponentSize.stampBadgeLarge,
    borderRadius: Radius.full,
    backgroundColor: ChildColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampEmoji: { fontSize: 28 },
  stampLabel: { ...TextStyle.label, color: ChildColors.textSecondary },
  shareSection: {
    width: '100%',
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  shareBtn: {
    width: '100%',
    height: ComponentSize.buttonHeight,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: ChildColors.primary,
    backgroundColor: ChildColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.primary },
  shareStatusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  shareStatusText: { ...TextStyle.label, color: ChildColors.textSecondary },
  shareDoneText: { ...TextStyle.label, color: ChildColors.primary },
  shareFailText: { ...TextStyle.label, color: '#FF5C5C' },
  retryText: { ...TextStyle.label, color: ChildColors.primary, textDecorationLine: 'underline' },
  actions: { width: '100%', marginTop: Spacing.lg, gap: Spacing.sm },
  primaryBtn: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
  secondaryBtn: {
    height: ComponentSize.buttonHeight,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: ChildColors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textPrimary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...TextStyle.body, color: ChildColors.textSecondary },
  praiseBanner: {
    backgroundColor: ChildColors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing['2xl'],
    alignItems: 'center',
  },
  praiseBannerText: { ...TextStyle.label, color: ChildColors.textOnPrimary },
});
