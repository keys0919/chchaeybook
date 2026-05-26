import { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
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
  const { session, setCard, setSentences, setSelectedHints } = useSessionStore();
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

  const { scheduleSave } = useDraft({
    draftId: session?.draftId ?? 'tmp',
    childId,
    bookTitle: session?.bookTitle ?? '',
    level,
    cardId: card?.card_id ?? '',
    cardType: card?.type ?? 'blank',
  });

  const handleTextComplete = (sentences: string[], selectedHints: string[]) => {
    setSentences(sentences);
    setSelectedHints(selectedHints);
    router.push('/write/complete');
  };

  const handleSkip = () => router.replace('/today');

  const handleInputChange = (text: string) => {
    scheduleSave({ type: 'text', text });
  };

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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.metaRow}>
          <Text style={styles.metaBook} numberOfLines={1}>{session.bookTitle}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {level}</Text>
          </View>
        </View>

        <View style={{ height: Spacing.md }} />

        <CardRenderer
          card={card}
          onComplete={handleTextComplete}
          onSkip={handleSkip}
          onInputChange={handleInputChange}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing['2xl'], paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  metaBook: { ...TextStyle.caption, color: ChildColors.textSecondary, flex: 1 },
  levelBadge: {
    backgroundColor: '#C8D8FF',
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelBadgeText: { ...TextStyle.caption, color: '#3D6FFF' },
  errorText: { ...TextStyle.body, color: ChildColors.textSecondary },
});
