// C-6 유료 전환 안내 — 혜택 소개 + 구독하기 + 복원
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ParentColors, Spacing, Radius, ComponentSize } from '../../src/design/tokens';
import { TextStyle } from '../../src/design/typography';
import { purchasePremium, restorePurchases, getMonthlyPrice } from '../../src/services/purchase.service';
import { useSubscriptionStore } from '../../src/stores/subscription.store';

const BENEFITS = [
  { icon: '📷', title: '사진·녹음 무제한', desc: '월 30개 한도 없이 모든 기록을 저장해요' },
  { icon: '📅', title: '월별 앨범 인화', desc: '한 달 독서 기록을 앨범으로 모아볼 수 있어요' },
  { icon: '✍️', title: 'Level 4 심화 글쓰기', desc: '자유 주제 독후감 카드를 사용할 수 있어요' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { setIsPaid } = useSubscriptionStore();
  const [price, setPrice] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    getMonthlyPrice().then(setPrice).catch(() => {});
  }, []);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const ok = await purchasePremium();
      if (ok) {
        setIsPaid(true);
        Alert.alert('구독 완료', '책쏙 프리미엄이 시작됐어요!', [
          { text: '확인', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('구독 실패', '구독을 완료하지 못했어요. 다시 시도해주세요.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const ok = await restorePurchases();
      if (ok) {
        setIsPaid(true);
        Alert.alert('복원 완료', '구독이 복원됐어요!', [
          { text: '확인', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('복원 결과', '복원할 수 있는 구독이 없어요.');
      }
    } finally {
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>책쏙 프리미엄</Text>
          <Text style={styles.heroDesc}>
            독서 기록을 더 풍부하게,{'\n'}아이의 성장을 더 생생하게
          </Text>
        </View>

        <View style={styles.benefitList}>
          {BENEFITS.map((b) => (
            <View key={b.title} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{b.icon}</Text>
              <View style={styles.benefitBody}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>월 구독</Text>
          <Text style={styles.priceValue}>
            {price ?? '...'}
          </Text>
          <Text style={styles.priceSub}>언제든지 취소 가능</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, purchasing && styles.primaryBtnDisabled]}
          onPress={handlePurchase}
          disabled={purchasing || restoring}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>지금 구독하기</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={handleRestore}
          disabled={purchasing || restoring}
        >
          {restoring ? (
            <ActivityIndicator color={ParentColors.textTertiary} size="small" />
          ) : (
            <Text style={styles.restoreBtnText}>구매 내역 복원</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.legal}>
          구독은 각 기간 종료 24시간 전 자동 갱신됩니다.{'\n'}
          App Store / Google Play 계정을 통해 관리할 수 있어요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ParentColors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    alignItems: 'flex-end',
  },
  backBtn: { padding: 4 },
  backText: { ...TextStyle.heading2, color: ParentColors.textSecondary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.lg },
  hero: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  heroEmoji: { fontSize: 48 },
  heroTitle: { ...TextStyle.heading1, color: ParentColors.textPrimary },
  heroDesc: {
    ...TextStyle.body,
    color: ParentColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitList: {
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  benefitIcon: { fontSize: 24, width: 32, textAlign: 'center', marginTop: 2 },
  benefitBody: { flex: 1, gap: 2 },
  benefitTitle: { ...TextStyle.label, color: ParentColors.textPrimary, fontWeight: '700' },
  benefitDesc: { ...TextStyle.caption, color: ParentColors.textSecondary, lineHeight: 18 },
  priceBox: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
  },
  priceLabel: { ...TextStyle.caption, color: ParentColors.textTertiary },
  priceValue: { ...TextStyle.heading1, color: ParentColors.primary, fontWeight: '700' },
  priceSub: { ...TextStyle.caption, color: ParentColors.textTertiary },
  primaryBtn: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ParentColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { ...TextStyle.label, color: '#fff', fontWeight: '700', fontSize: 16 },
  restoreBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreBtnText: { ...TextStyle.label, color: ParentColors.textSecondary },
  legal: {
    ...TextStyle.caption,
    color: ParentColors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
