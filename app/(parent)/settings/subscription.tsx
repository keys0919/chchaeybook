// C-16 구독 · 결제 관리
import { useCallback, useState } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import { ParentColors, Spacing, Radius, ComponentSize } from '../../../src/design/tokens';
import { TextStyle } from '../../../src/design/typography';
import { useAuthStore } from '../../../src/stores/auth.store';
import { useSubscriptionStore } from '../../../src/stores/subscription.store';
import { restorePurchases } from '../../../src/services/purchase.service';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { isPaid, isChecking, checkSubscription, setIsPaid } = useSubscriptionStore();
  const [restoring, setRestoring] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (session?.user.id) {
        checkSubscription(session.user.id);
      }
    }, [session?.user.id])
  );

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const ok = await restorePurchases();
      if (ok) {
        setIsPaid(true);
        Alert.alert('복원 완료', '구독이 복원됐어요!');
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
          <Text style={styles.backText}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>구독 · 결제</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 현재 플랜 */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>현재 플랜</Text>
          <View style={styles.planRow}>
            {isChecking ? (
              <ActivityIndicator color={ParentColors.primary} size="small" />
            ) : (
              <>
                <View style={[styles.planBadge, isPaid && styles.planBadgePaid]}>
                  <Text style={[styles.planBadgeText, isPaid && styles.planBadgeTextPaid]}>
                    {isPaid ? '프리미엄' : '무료'}
                  </Text>
                </View>
                <Text style={styles.planDesc}>
                  {isPaid
                    ? '모든 기능을 사용할 수 있어요.'
                    : '일부 기능이 제한돼요.'}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={{ height: Spacing.md }} />

        {/* 액션 */}
        {!isPaid ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(parent)/paywall' as any)}
          >
            <Text style={styles.primaryBtnText}>프리미엄으로 업그레이드</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>구독 관리</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>
                App Store 또는 Google Play 구독 설정에서{'\n'}갱신일 확인 및 해지할 수 있어요.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: Spacing.md }} />

        {/* 복원 */}
        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={handleRestore}
          disabled={restoring}
        >
          {restoring ? (
            <ActivityIndicator color={ParentColors.textTertiary} size="small" />
          ) : (
            <Text style={styles.restoreBtnText}>구매 내역 복원</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: Spacing.md }} />

        {/* 정보 */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>혜택 비교</Text>
          {[
            { label: '기록 카드 (L1–L3)', free: '✓', paid: '✓' },
            { label: 'Level 4 심화 카드', free: '✗', paid: '✓' },
            { label: '사진·녹음 한도', free: '30개', paid: '무제한' },
            { label: '월별 앨범 인화', free: '✗', paid: '✓' },
          ].map((row) => (
            <View key={row.label} style={styles.compareRow}>
              <Text style={styles.compareLabel}>{row.label}</Text>
              <Text style={[styles.compareValue, !isPaid && styles.compareValueFree]}>{row.free}</Text>
              <Text style={[styles.compareValue, isPaid && styles.compareValuePaid]}>{row.paid}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ParentColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ParentColors.divider,
  },
  backBtn: { width: 56, paddingVertical: 4 },
  backText: { ...TextStyle.body, color: ParentColors.primary },
  headerTitle: { ...TextStyle.heading2, color: ParentColors.textPrimary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  group: {
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
    overflow: 'hidden',
  },
  groupLabel: {
    ...TextStyle.caption,
    color: ParentColors.textTertiary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 4,
    backgroundColor: ParentColors.background,
    borderBottomWidth: 1,
    borderBottomColor: ParentColors.divider,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  planBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    backgroundColor: ParentColors.surface2,
    borderWidth: 1,
    borderColor: ParentColors.divider,
  },
  planBadgePaid: {
    backgroundColor: '#FFF8E7',
    borderColor: '#F5A623',
  },
  planBadgeText: { ...TextStyle.caption, color: ParentColors.textSecondary, fontWeight: '700' },
  planBadgeTextPaid: { color: '#7C5400' },
  planDesc: { ...TextStyle.body, color: ParentColors.textSecondary, flex: 1 },
  primaryBtn: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ParentColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: { ...TextStyle.label, color: '#fff', fontWeight: '700' },
  infoRow: { padding: Spacing.md },
  infoText: { ...TextStyle.body, color: ParentColors.textSecondary, lineHeight: 22 },
  restoreBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreBtnText: { ...TextStyle.label, color: ParentColors.textTertiary },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: ParentColors.divider,
    gap: Spacing.sm,
  },
  compareLabel: { ...TextStyle.body, color: ParentColors.textSecondary, flex: 1 },
  compareValue: {
    ...TextStyle.label,
    color: ParentColors.textTertiary,
    width: 48,
    textAlign: 'center',
  },
  compareValueFree: { color: ParentColors.statusError },
  compareValuePaid: { color: ParentColors.statusSuccess },
});
