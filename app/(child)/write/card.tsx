import { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChildColors, Spacing, Radius } from '../../../src/design/tokens';
import { TextStyle } from '../../../src/design/typography';
import { useSessionStore } from '../../../src/stores/session.store';
import { useProfileStore } from '../../../src/stores/profile.store';
import { CardRenderer } from '../../../src/components/child/CardRenderer';
import { useDraft } from '../../../src/hooks/useDraft';
import { useCard, logCardUsage } from '../../../src/hooks/useCard';

export default function CardScreen() {
  const router = useRouter();
  const { session, setCard, setSentences, setSelectedHints, startSession } = useSessionStore();
  const { profile } = useProfileStore();

  const level = session?.level ?? 1;
  const childId = profile?.child_id ?? '';

  const { card: fetchedCard, loading, error } = useCard(level, childId, null);

  useEffect(() => {
    if (fetchedCard && session && !session.card) {
      setCard(fetchedCard);
      if (childId) logCardUsage(childId, fetchedCard.card_id);
    }
  }, [fetchedCard, session, childId, setCard]);

  const card = session?.card ?? fetchedCard;

  useDraft({
    draftId: session?.draftId ?? 'tmp',
    childId,
    bookTitle: session?.bookTitle ?? '',
    level,
    cardId: card?.card_id ?? '',
    cardType: card?.type ?? 'blank',
  });

  const MAX_CARDS = level === 6 ? 1 : 4;
  const isLastCard = (session?.sessionIndex ?? 1) >= MAX_CARDS;

  const handleComplete = () => {
    if (!isLastCard && session) {
      startSession(session.bookTitle, session.author, level, session.sessionIndex + 1);
      router.replace('/write/card' as any);
    } else {
      setSentences([]);
      setSelectedHints([]);
      router.push('/write/complete');
    }
  };

  const handleSkip = () => router.replace('/today');

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>세션 정보가 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading || !card) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <ActivityIndicator color={ChildColors.primary} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.metaRow}>
        <Text style={styles.metaBook} numberOfLines={1}>{session.bookTitle}</Text>
        <View style={styles.metaRight}>
          {MAX_CARDS > 1 && (
            <Text style={styles.progressText}>{session.sessionIndex}/{MAX_CARDS}</Text>
          )}
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {level}</Text>
          </View>
        </View>
      </View>

      <CardRenderer
        card={card}
        onComplete={handleComplete}
        onSkip={handleSkip}
        isLastCard={isLastCard}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  metaBook: { ...TextStyle.caption, color: ChildColors.textSecondary, flex: 1 },
  metaRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  progressText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: ChildColors.textTertiary,
  },
  levelBadge: {
    backgroundColor: '#C8D8FF',
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelBadgeText: { ...TextStyle.caption, color: '#3D6FFF' },
  errorText: { ...TextStyle.body, color: ChildColors.textSecondary },
});
