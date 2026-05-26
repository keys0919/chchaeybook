import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChildColors,
  Spacing,
  Radius,
  ComponentSize,
  WarmShadow,
  CopyTokens,
} from '../../../src/design/tokens';
import { TextStyle, ModeTypography, FontFamily } from '../../../src/design/typography';
import { useSessionStore } from '../../../src/stores/session.store';
import { useProfileStore } from '../../../src/stores/profile.store';
import { createRecord, getChildWeeklyCount } from '../../../src/services/record.service';
import { removeDraft } from '../../../src/services/draft.service';

const STAMP_EMOJI = ['⭐', '🌟', '🏅', '📚', '✨', '🎖', '🥇'];

function pickStamp(level: number, sessionIndex: number): string {
  const idx = (level - 1 + sessionIndex - 1) % STAMP_EMOJI.length;
  return STAMP_EMOJI[idx];
}

function pickPraiseText(): string {
  const idx = Math.floor(Math.random() * CopyTokens.STAMP_TEXTS.length);
  return CopyTokens.STAMP_TEXTS[idx];
}

export default function CompleteScreen() {
  const router = useRouter();
  const { session, clearSession } = useSessionStore();
  const { profile } = useProfileStore();

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const stampScale = useRef(new Animated.Value(0)).current;
  const stampOpacity = useRef(new Animated.Value(0)).current;
  const stampTextOpacity = useRef(new Animated.Value(0)).current;
  const stampTextTranslateY = useRef(new Animated.Value(8)).current;
  const praiseOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;

  const [displayedText, setDisplayedText] = useState('');
  const [praiseText] = useState(() => pickPraiseText());
  const [sequenceDone, setSequenceDone] = useState(false);
  const sequenceDoneRef = useRef(false);
  const [saved, setSaved] = useState(false);
  const [weeklyCount, setWeeklyCount] = useState<number | null>(null);

  const fullSentence = session?.sentences[0] ?? '';

  const finishSequence = useCallback(() => {
    if (sequenceDoneRef.current) return;
    sequenceDoneRef.current = true;
    setDisplayedText(fullSentence);
    cardOpacity.setValue(1);
    cardScale.setValue(1);
    stampScale.setValue(1);
    stampOpacity.setValue(1);
    stampTextOpacity.setValue(1);
    stampTextTranslateY.setValue(0);
    praiseOpacity.setValue(1);
    ctaOpacity.setValue(1);
    setSequenceDone(true);
  }, [fullSentence]);

  useEffect(() => {
    if (!session || !profile || saved) return;

    setSaved(true);
    const recordId = crypto.randomUUID();
    const stamp = pickStamp(session.level, session.sessionIndex);
    const now = new Date().toISOString();
    const record = {
      record_id: recordId,
      child_id: profile.child_id,
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
      getChildWeeklyCount(profile.child_id).then(setWeeklyCount).catch(() => {});
    }).catch(() => {});

    if (session.draftId) removeDraft(session.draftId);

    const timers: ReturnType<typeof setTimeout>[] = [];
    let typingInterval: ReturnType<typeof setInterval> | null = null;

    Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();

    const typingTimer = setTimeout(() => {
      const text = fullSentence.slice(0, 30);
      if (!text) {
        runStampSequence(timers);
        return;
      }
      let idx = 0;
      typingInterval = setInterval(() => {
        idx++;
        setDisplayedText(text.slice(0, idx));
        if (idx >= text.length) {
          if (typingInterval) clearInterval(typingInterval);
          const shakeTimer = setTimeout(() => {
            Animated.sequence([
              Animated.timing(cardScale, { toValue: 1.03, duration: 75, useNativeDriver: true }),
              Animated.timing(cardScale, { toValue: 1.0, duration: 75, useNativeDriver: true }),
            ]).start(() => runStampSequence(timers));
          }, 100);
          timers.push(shakeTimer);
        }
      }, 40);
    }, 200);
    timers.push(typingTimer);

    return () => {
      if (typingInterval) clearInterval(typingInterval);
      timers.forEach(clearTimeout);
    };
  }, []);

  function runStampSequence(timers: ReturnType<typeof setTimeout>[]) {
    const t1 = setTimeout(() => {
      Animated.timing(stampOpacity, { toValue: 1, duration: 50, useNativeDriver: true }).start();
      Animated.spring(stampScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
    }, 100);
    timers.push(t1);

    const t2 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(stampTextOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(stampTextTranslateY, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }, 600);
    timers.push(t2);

    const t3 = setTimeout(() => {
      Animated.timing(praiseOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }, 850);
    timers.push(t3);

    const t4 = setTimeout(() => {
      Animated.timing(ctaOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start(() => {
        sequenceDoneRef.current = true;
        setSequenceDone(true);
      });
    }, 1000);
    timers.push(t4);
  }

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
      <TouchableWithoutFeedback onPress={!sequenceDone ? finishSequence : undefined}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} scrollEnabled={sequenceDone}>
            {/* 완성 카드 */}
            <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
              <Text style={styles.cardBookTitle} numberOfLines={1}>{session.bookTitle}</Text>
              <View style={{ height: Spacing.sm }} />
              <Text style={styles.cardDoneText}>독서록에 기록했어요 ✓</Text>
            </Animated.View>

            <View style={{ height: Spacing.xl }} />

            {/* 도장 */}
            <View style={styles.stampArea}>
              <Animated.View style={{ opacity: stampOpacity, transform: [{ scale: stampScale }] }}>
                <Text style={styles.stampEmoji}>{stamp}</Text>
              </Animated.View>
              <Animated.View style={{ opacity: stampTextOpacity, transform: [{ translateY: stampTextTranslateY }] }}>
                <Text style={styles.stampLabel}>
                  {weeklyCount !== null ? `이번 주 ${weeklyCount}번째 기록!` : '도장 획득!'}
                </Text>
              </Animated.View>
            </View>

            <View style={{ height: Spacing.lg }} />

            {/* 칭찬 문구 */}
            <Animated.View style={{ opacity: praiseOpacity, alignItems: 'center' }}>
              <Text style={styles.praiseText}>{praiseText}</Text>
            </Animated.View>

            <View style={{ height: Spacing.xl }} />

            {/* CTA */}
            <Animated.View style={{ opacity: ctaOpacity, gap: Spacing.md, width: '100%' }}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleHome}>
                <Text style={styles.primaryBtnText}>홈으로</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...TextStyle.body, color: ChildColors.textSecondary },
  card: {
    width: '100%',
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: 20,
    ...WarmShadow,
    shadowColor: '#1A1A1A',
  },
  cardBookTitle: { ...TextStyle.caption, color: ChildColors.textTertiary },
  cardDoneText: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: ChildColors.statusSuccess,
    lineHeight: 24,
    marginTop: 4,
  },
  stampArea: { alignItems: 'center', gap: Spacing.sm },
  stampEmoji: { fontSize: 72 },
  stampLabel: {
    ...TextStyle.label,
    color: ChildColors.textSecondary,
    textAlign: 'center',
  },
  praiseText: {
    ...TextStyle.title,
    color: ChildColors.primary,
    textAlign: 'center',
    fontWeight: '700',
  },
  primaryBtn: {
    width: '100%',
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
  secondaryBtn: {
    width: '100%',
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primaryLight,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.primary },
});
