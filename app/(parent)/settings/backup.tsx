// C-17 백업 설정 — 미디어 한도 현황 + 15개↑ 배너
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ParentColors, Spacing, Radius } from '../../../src/design/tokens';
import { TextStyle } from '../../../src/design/typography';
import { useAuthStore } from '../../../src/stores/auth.store';
import { useSubscriptionStore } from '../../../src/stores/subscription.store';
import { useMediaQuota } from '../../../src/hooks/useMediaQuota';

export default function BackupSettingsScreen() {
  const router = useRouter();
  const { childProfile } = useAuthStore();
  const { isPaid } = useSubscriptionStore();
  const isLocked = !isPaid;
  const quota = useMediaQuota(childProfile?.child_id ?? '');

  const quotaPercent = Math.min((quota.count / 30) * 100, 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>백업 설정</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 15개↑ 배너 */}
        {quota.isNearLimit && !isLocked ? (
          <View style={styles.warningBanner}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningBody}>
              <Text style={styles.warningTitle}>저장 공간이 얼마 남지 않았어요</Text>
              <Text style={styles.warningDesc}>
                {quota.count}개 사용 중. 30개 이상이면 가장 오래된 기록부터 삭제돼요.
              </Text>
              <TouchableOpacity onPress={() => router.push('/(parent)/paywall' as any)}>
                <Text style={styles.warningLink}>프리미엄으로 업그레이드 →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* 현황 */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>저장 현황</Text>

          <View style={styles.quotaSection}>
            <View style={styles.quotaRow}>
              <Text style={styles.quotaLabel}>사진 · 녹음 사용량</Text>
              <Text style={[styles.quotaValue, quota.isNearLimit && styles.quotaValueWarning]}>
                {quota.count} / 30
              </Text>
            </View>
            <View style={styles.quotaTrack}>
              <View
                style={[
                  styles.quotaFill,
                  { width: `${quotaPercent}%` as any },
                  quota.isNearLimit && styles.quotaFillWarning,
                  quota.isAtLimit && styles.quotaFillDanger,
                ]}
              />
            </View>
            <Text style={styles.quotaDesc}>
              {quota.isAtLimit
                ? '가득 찼어요. 새 기록을 저장하려면 오래된 기록을 삭제해야 해요.'
                : quota.isNearLimit
                ? `${30 - quota.count}개 남았어요.`
                : '여유 있게 사용 중이에요.'}
            </Text>
          </View>
        </View>

        <View style={{ height: Spacing.md }} />

        {/* 정책 안내 */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>보관 정책</Text>
          <View style={styles.policySection}>
            {[
              { label: '무료 보관 기간', value: '공유 후 30일' },
              { label: '기기 로컬 저장', value: '앱 삭제 전까지' },
              { label: '30개 초과 시', value: '가장 오래된 기록 자동 삭제' },
            ].map((item, i) => (
              <View key={i} style={styles.policyRow}>
                <Text style={styles.policyLabel}>{item.label}</Text>
                <Text style={styles.policyValue}>{item.value}</Text>
              </View>
            ))}
          </View>
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
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#FFF8E7',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: ParentColors.statusWarning,
  },
  warningIcon: { fontSize: 18 },
  warningBody: { flex: 1, gap: 4 },
  warningTitle: { ...TextStyle.label, color: '#7C5400', fontWeight: '700' },
  warningDesc: { ...TextStyle.caption, color: '#7C5400', lineHeight: 18 },
  warningLink: { ...TextStyle.caption, color: '#7C5400', fontWeight: '700', textDecorationLine: 'underline', marginTop: 4 },
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
  quotaSection: { padding: Spacing.md, gap: Spacing.sm },
  quotaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quotaLabel: { ...TextStyle.body, color: ParentColors.textPrimary },
  quotaValue: { ...TextStyle.label, color: ParentColors.textTertiary, fontWeight: '700' },
  quotaValueWarning: { color: ParentColors.statusWarning },
  quotaTrack: {
    height: 8,
    backgroundColor: ParentColors.surface2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  quotaFill: {
    height: '100%',
    backgroundColor: ParentColors.statusSuccess,
    borderRadius: 4,
  },
  quotaFillWarning: { backgroundColor: ParentColors.statusWarning },
  quotaFillDanger: { backgroundColor: ParentColors.statusError },
  quotaDesc: { ...TextStyle.caption, color: ParentColors.textSecondary },
  policySection: { padding: Spacing.md, gap: Spacing.sm },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: ParentColors.divider,
  },
  policyLabel: { ...TextStyle.body, color: ParentColors.textSecondary },
  policyValue: { ...TextStyle.label, color: ParentColors.textPrimary },
});
