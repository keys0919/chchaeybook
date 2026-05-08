// C-3 기록 상세 + C-4 칭찬 카드 Bottom Sheet + 미디어 섹션
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import {
  ParentColors,
  Spacing,
  Radius,
  Shadow,
  WarmShadow,
  ComponentSize,
} from '../../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../../src/design/typography';
import { useAuthStore } from '../../../src/stores/auth.store';
import {
  getParentRecord,
  sendPraise,
  getPraiseForRecord,
  type ParentRecord,
} from '../../../src/services/parent-record.service';
import {
  getMediaSharesForRecord,
  getSignedUrl,
} from '../../../src/services/media.service';
import {
  scheduleLocalNotification,
  scheduleExpiryNotificationIfNeeded,
} from '../../../src/services/notification.service';
import { useNotificationStore } from '../../../src/stores/notification.store';
import type { ParentPraise } from '../../../src/types/db.types';
import type { MediaShare } from '../../../src/types/media.types';

// 오디오 재생 카드 (한 인스턴스 = 한 트랙)
function AudioCard({ signedUrl }: { signedUrl: string }) {
  const player = useAudioPlayer(signedUrl);
  const status = useAudioPlayerStatus(player);
  return (
    <TouchableOpacity
      style={mediaStyles.audioCard}
      onPress={() => (status.playing ? player.pause() : player.play())}
    >
      <Text style={mediaStyles.audioIcon}>{status.playing ? '⏸' : '▶'}</Text>
      <Text style={mediaStyles.audioLabel}>
        {status.playing ? '재생 중' : '녹음 재생'}
      </Text>
    </TouchableOpacity>
  );
}

const mediaStyles = StyleSheet.create({
  mediaSection: { marginBottom: Spacing.md },
  mediaSectionLabel: { ...TextStyle.label, color: ParentColors.textSecondary, marginBottom: Spacing.sm },
  photoThumb: { width: '100%', height: 200, borderRadius: Radius.md, marginBottom: Spacing.sm },
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
    backgroundColor: ParentColors.surface1,
    marginBottom: Spacing.sm,
  },
  audioIcon: { fontSize: 20 },
  audioLabel: { ...TextStyle.body, color: ParentColors.textPrimary },
});

// C-4 칭찬 카드 10종
const PRAISE_CARDS = [
  { id: 'p1', emoji: '⭐', message: '정말 잘했어!' },
  { id: 'p2', emoji: '📝', message: '멋진 문장이야!' },
  { id: 'p3', emoji: '🏆', message: '우리 아이 최고!' },
  { id: 'p4', emoji: '💪', message: '엄청 대단해!' },
  { id: 'p5', emoji: '📚', message: '이만큼 읽었어?' },
  { id: 'p6', emoji: '🌟', message: '내일도 쓰자!' },
  { id: 'p7', emoji: '💖', message: '자랑스러워!' },
  { id: 'p8', emoji: '✨', message: '글솜씨가 늘었네!' },
  { id: 'p9', emoji: '🔥', message: '꾸준히 쓰다니!' },
  { id: 'p10', emoji: '😊', message: '같이 읽어요!' },
] as const;

function levelLabel(level: number): string {
  const names = ['', '한 문장', '두 문장', '이야기', '키트'];
  return `Level ${level} · ${names[level] ?? ''}`;
}

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// CoachingCard 접힘/펼침
function CoachingCard({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.timing(anim, { toValue, duration: 250, useNativeDriver: false }).start();
  };

  const maxHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });

  return (
    <View style={coachingStyles.container}>
      <TouchableOpacity onPress={toggle} style={coachingStyles.header} activeOpacity={0.7}>
        <Text style={coachingStyles.title}>💡 코칭 가이드</Text>
        <Text style={coachingStyles.chevron}>{expanded ? '∧' : '∨'}</Text>
      </TouchableOpacity>
      <Animated.View style={{ maxHeight, overflow: 'hidden' }}>
        <Text style={coachingStyles.body}>{text}</Text>
      </Animated.View>
    </View>
  );
}

const coachingStyles = StyleSheet.create({
  container: {
    backgroundColor: '#EBF4FF',
    borderLeftWidth: 3,
    borderLeftColor: ParentColors.statusInfo,
    borderRadius: 6,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  title: { ...TextStyle.label, color: ParentColors.statusInfo },
  chevron: { ...TextStyle.label, color: ParentColors.statusInfo },
  body: { ...TextStyle.body, color: ParentColors.textSecondary, padding: Spacing.md, paddingTop: 0 },
});

// C-4 Bottom Sheet
function PraiseSheet({
  visible,
  onClose,
  onSend,
  sending,
}: {
  visible: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  sending: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      setSelected(null);
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  const CARD_WIDTH = (320 - Spacing.sm) / 2;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={sheetStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[sheetStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={sheetStyles.handle} />
        <Text style={sheetStyles.title}>어떤 칭찬을 보낼까요?</Text>
        <FlatList
          data={PRAISE_CARDS}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: Spacing.sm }}
          contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.md }}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const isSelected = selected === item.id;
            return (
              <TouchableOpacity
                style={[
                  sheetStyles.praiseCard,
                  { width: CARD_WIDTH },
                  isSelected && sheetStyles.praiseCardSelected,
                ]}
                onPress={() => setSelected(isSelected ? null : item.id)}
              >
                <Text style={sheetStyles.praiseEmoji}>{item.emoji}</Text>
                <Text style={[sheetStyles.praiseMessage, isSelected && sheetStyles.praiseMessageSelected]}>
                  {item.message}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
        <TouchableOpacity
          style={[sheetStyles.sendBtn, !selected && sheetStyles.sendBtnDisabled]}
          onPress={() => {
            if (!selected) return;
            const card = PRAISE_CARDS.find((c) => c.id === selected);
            if (card) onSend(card.message);
          }}
          disabled={!selected || sending}
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={sheetStyles.sendBtnText}>보내기</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: ParentColors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: { ...TextStyle.title, color: ParentColors.textPrimary, marginBottom: Spacing.md },
  praiseCard: {
    height: 120,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: ParentColors.divider,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  praiseCardSelected: {
    borderWidth: 2,
    borderColor: ParentColors.primary,
    backgroundColor: '#FFF8F5',
  },
  praiseEmoji: { fontSize: 28 },
  praiseMessage: { ...TextStyle.label, color: ParentColors.textPrimary, textAlign: 'center' },
  praiseMessageSelected: { color: ParentColors.primary },
  sendBtn: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ParentColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  sendBtnDisabled: { backgroundColor: ParentColors.divider },
  sendBtnText: { ...ModeTypography.buttonLabel, color: '#FFFFFF' },
});

// ─── 메인 C-3 화면 ───────────────────────────────────────────

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session, childProfile } = useAuthStore();

  const [record, setRecord] = useState<ParentRecord | null>(null);
  const [praise, setPraise] = useState<ParentPraise | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [mediaShares, setMediaShares] = useState<MediaShare[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    Promise.all([getParentRecord(id), getPraiseForRecord(id), getMediaSharesForRecord(id)])
      .then(([rec, pr, shares]) => {
        setRecord(rec);
        setPraise(pr);
        const typed = shares as MediaShare[];
        setMediaShares(typed);
        // signed URL 발급
        const urlPromises = typed
          .filter((s) => s.storage_path)
          .map(async (s) => {
            const url = await getSignedUrl(s.storage_path!);
            return { share_id: s.share_id, url };
          });
        Promise.all(urlPromises).then((results) => {
          const map: Record<string, string> = {};
          results.forEach(({ share_id, url }) => { if (url) map[share_id] = url; });
          setSignedUrls(map);
        });
        // 만료 임박 알림 예약 (미디어 공유가 있고 만료 알림이 켜져 있을 때)
        const { prefs } = useNotificationStore.getState();
        if (prefs.mediaExpiry && rec) {
          typed.forEach((s) => {
            if (s.expires_at) {
              scheduleExpiryNotificationIfNeeded(s.expires_at, rec.record_id).catch(() => {});
            }
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendPraise = useCallback(
    async (message: string) => {
      if (!record || !session || !childProfile) return;
      setSending(true);
      try {
        await sendPraise(record.record_id, session.user.id, childProfile.child_id, message);
        const updated = await getPraiseForRecord(record.record_id);
        setPraise(updated);
        setRecord((prev) => prev ? { ...prev, parent_praise_id: updated?.praise_id ?? null } : prev);
        setSheetVisible(false);
        if (Platform.OS === 'android') {
          ToastAndroid.show('칭찬을 보냈어요!', ToastAndroid.SHORT);
        }
        // 아이 기기(동일 기기)에 로컬 알림
        const { prefs } = useNotificationStore.getState();
        if (prefs.praiseArrived) {
          scheduleLocalNotification(
            '부모님이 칭찬을 보냈어요! 🌟',
            '새 칭찬 카드가 도착했어요. 확인해보세요!',
            { screen: 'child-today' }
          ).catch(() => {});
        }
      } catch {
        // 전송 실패 — 시트 유지
      } finally {
        setSending(false);
      }
    },
    [record, session, childProfile]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color={ParentColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!record) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>기록을 불러올 수 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const praised = !!record.parent_praise_id;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>기록 상세</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 책 정보 */}
        <View style={styles.bookSection}>
          <Text style={styles.bookTitle} numberOfLines={2}>{record.book_title}</Text>
          {record.author ? (
            <Text style={styles.bookAuthor}>{record.author}</Text>
          ) : null}
          <Text style={styles.metaText}>{levelLabel(record.level)} · {dateLabel(record.read_date)}</Text>
        </View>

        <View style={styles.divider} />

        {/* 완성 문장 */}
        <View style={styles.sentenceSection}>
          {record.sentences.map((s, i) => (
            <View key={i} style={styles.sentenceRow}>
              <View style={styles.quoteBar} />
              <Text style={styles.sentenceText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* 도장 */}
        {record.badges.length > 0 ? (
          <View style={styles.badgesRow}>
            {record.badges.map((b, i) => (
              <Text key={i} style={styles.badge}>{b}</Text>
            ))}
          </View>
        ) : null}

        {/* 미디어 섹션 */}
        {mediaShares.length > 0 ? (
          <View style={mediaStyles.mediaSection}>
            <Text style={mediaStyles.mediaSectionLabel}>첨부 미디어</Text>
            {mediaShares.map((share) => {
              const url = signedUrls[share.share_id];
              if (!url) return null;
              if (share.media_type === 'photo') {
                return (
                  <Image
                    key={share.share_id}
                    source={{ uri: url }}
                    style={mediaStyles.photoThumb}
                    resizeMode="cover"
                  />
                );
              }
              return <AudioCard key={share.share_id} signedUrl={url} />;
            })}
          </View>
        ) : null}

        {/* CoachingCard */}
        {record.parent_coaching ? (
          <CoachingCard text={record.parent_coaching} />
        ) : null}

        {/* S2: 이미 칭찬 보낸 상태 */}
        {praised && praise ? (
          <View style={styles.praisedCard}>
            <Text style={styles.praisedLabel}>보낸 칭찬</Text>
            <Text style={styles.praisedMessage}>{praise.message}</Text>
          </View>
        ) : null}

        {/* sticky CTA 높이만큼 여백 */}
        <View style={{ height: ComponentSize.buttonHeight + Spacing.lg * 2 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyFooter}>
        {praised ? (
          <View style={styles.praisedCTA}>
            <Text style={styles.praisedCTAText}>✓ 칭찬을 보냈어요</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.praiseCTA} onPress={() => setSheetVisible(true)}>
            <Text style={styles.praiseCTAText}>칭찬 보내기</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* C-4 Bottom Sheet */}
      <PraiseSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSend={handleSendPraise}
        sending={sending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ParentColors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { ...TextStyle.body, color: ParentColors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ParentColors.divider,
  },
  backBtn: { width: 60 },
  backText: { ...TextStyle.body, color: ParentColors.primary },
  headerTitle: { flex: 1, ...TextStyle.title, color: ParentColors.textPrimary, textAlign: 'center' },
  content: { padding: Spacing.lg },
  bookSection: { marginBottom: Spacing.md },
  bookTitle: { ...TextStyle.heading2, color: ParentColors.textPrimary },
  bookAuthor: { ...TextStyle.caption, color: ParentColors.textSecondary, marginTop: 2 },
  metaText: { ...TextStyle.caption, color: ParentColors.textTertiary, marginTop: Spacing.xs },
  divider: { height: 1, backgroundColor: ParentColors.divider, marginBottom: Spacing.md },
  sentenceSection: { marginBottom: Spacing.md },
  sentenceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  quoteBar: {
    width: 3,
    backgroundColor: ParentColors.primary,
    borderRadius: 2,
    minHeight: 20,
    marginTop: 3,
  },
  sentenceText: { ...TextStyle.body, color: ParentColors.textPrimary, flex: 1, lineHeight: 26 },
  badgesRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  badge: { fontSize: 24 },
  praisedCard: {
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: ParentColors.primaryLight,
    marginBottom: Spacing.md,
  },
  praisedLabel: { ...TextStyle.caption, color: ParentColors.textTertiary, marginBottom: 4 },
  praisedMessage: { ...TextStyle.body, color: ParentColors.primary, fontWeight: '600' },
  stickyFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: ParentColors.divider,
    backgroundColor: ParentColors.background,
  },
  praiseCTA: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ParentColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  praiseCTAText: { ...ModeTypography.buttonLabel, color: '#FFFFFF' },
  praisedCTA: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ParentColors.divider,
  },
  praisedCTAText: { ...ModeTypography.buttonLabel, color: ParentColors.textSecondary },
});
