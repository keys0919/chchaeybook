// C-15 설정 홈 — 계정 / 저장 용량 / 알림 토글(Phase 8에서 실구현)
import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ParentColors, Spacing, Radius } from '../../../src/design/tokens';
import { TextStyle } from '../../../src/design/typography';
import { useAuthStore } from '../../../src/stores/auth.store';
import { useMediaQuota } from '../../../src/hooks/useMediaQuota';
import { useNotificationStore } from '../../../src/stores/notification.store';
import { useSubscriptionStore } from '../../../src/stores/subscription.store';
import { requestPermission } from '../../../src/services/notification.service';

export default function SettingsScreen() {
  const router = useRouter();
  const { childProfile, session, signOut } = useAuthStore();
  const { prefs, loadPrefs, setPrefs } = useNotificationStore();

  const quota = useMediaQuota(childProfile?.child_id ?? '');
  const { isPaid } = useSubscriptionStore();

  useFocusEffect(
    useCallback(() => {
      loadPrefs();
    }, [])
  );

  const handleNotifyToggle = async (key: 'praiseArrived' | 'newRecord' | 'mediaShared', value: boolean) => {
    if (value) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('알림 권한 필요', '설정 앱에서 알림 권한을 허용해주세요.');
        return;
      }
    }
    await setPrefs({ [key]: value });
  };

  const quotaPercent = Math.min((quota.count / 30) * 100, 100);

  const handleSignOut = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 계정 */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>계정</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>이메일</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {session?.user.email ?? '-'}
            </Text>
          </View>
          <TouchableOpacity style={styles.rowBtn} onPress={handleSignOut}>
            <Text style={styles.rowLabelDanger}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.md }} />

        {/* 구독 */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>구독</Text>
          <TouchableOpacity
            style={styles.rowBtn}
            onPress={() => router.push('/(parent)/settings/subscription' as any)}
          >
            <View style={styles.rowPlanWrap}>
              <Text style={styles.rowLabel}>현재 플랜</Text>
              <View style={[styles.planBadge, isPaid && styles.planBadgePaid]}>
                <Text style={[styles.planBadgeText, isPaid && styles.planBadgeTextPaid]}>
                  {isPaid ? '프리미엄' : '무료'}
                </Text>
              </View>
            </View>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.md }} />

        {/* 저장 용량 */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>저장 용량</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>사진 · 녹음</Text>
            <Text style={styles.rowValue}>{quota.count}/30</Text>
          </View>
          <View style={styles.quotaBarWrap}>
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
            {quota.isNearLimit ? (
              <Text style={styles.quotaHint}>
                {quota.isAtLimit
                  ? '저장 공간이 가득 찼어요.'
                  : '저장 공간이 얼마 남지 않았어요.'}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.rowBtn}
            onPress={() => router.push('/(parent)/settings/backup' as any)}
          >
            <Text style={styles.rowLabel}>백업 설정</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.md }} />

        {/* 알림 */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>알림</Text>
          <View style={styles.rowSwitch}>
            <Text style={styles.rowLabel}>칭찬 도착 알림</Text>
            <Switch
              value={prefs.praiseArrived}
              onValueChange={(v) => handleNotifyToggle('praiseArrived', v)}
              trackColor={{ true: ParentColors.primary, false: ParentColors.divider }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.rowSwitch}>
            <Text style={styles.rowLabel}>새 기록 도착 알림</Text>
            <Switch
              value={prefs.newRecord}
              onValueChange={(v) => handleNotifyToggle('newRecord', v)}
              trackColor={{ true: ParentColors.primary, false: ParentColors.divider }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.rowSwitch}>
            <Text style={styles.rowLabel}>미디어 공유 알림</Text>
            <Switch
              value={prefs.mediaShared}
              onValueChange={(v) => handleNotifyToggle('mediaShared', v)}
              trackColor={{ true: ParentColors.primary, false: ParentColors.divider }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={{ height: Spacing.md }} />

        {/* 기타 */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>기타</Text>
          <TouchableOpacity
            style={styles.rowBtn}
            onPress={() => router.push('/(parent)/settings/privacy' as any)}
          >
            <Text style={styles.rowLabel}>개인정보 처리방침 · 탈퇴</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.xl }} />
        <Text style={styles.version}>책쏙 v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ParentColors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ParentColors.divider,
  },
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: ParentColors.divider,
  },
  rowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: ParentColors.divider,
  },
  rowSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: ParentColors.divider,
  },
  rowPlanWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    backgroundColor: ParentColors.surface2,
    borderWidth: 1,
    borderColor: ParentColors.divider,
  },
  planBadgePaid: { backgroundColor: '#FFF8E7', borderColor: '#F5A623' },
  planBadgeText: { ...TextStyle.caption, color: ParentColors.textSecondary, fontWeight: '700' },
  planBadgeTextPaid: { color: '#7C5400' },
  rowLabel: { ...TextStyle.body, color: ParentColors.textPrimary },
  rowLabelMuted: { ...TextStyle.body, color: ParentColors.textTertiary },
  rowLabelDanger: { ...TextStyle.body, color: ParentColors.statusError },
  rowValue: { ...TextStyle.body, color: ParentColors.textTertiary, maxWidth: '60%' },
  rowArrow: { ...TextStyle.body, color: ParentColors.textTertiary },
  quotaBarWrap: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: ParentColors.divider,
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  quotaTrack: {
    height: 6,
    backgroundColor: ParentColors.surface2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  quotaFill: {
    height: '100%',
    backgroundColor: ParentColors.statusSuccess,
    borderRadius: 3,
  },
  quotaFillWarning: { backgroundColor: ParentColors.statusWarning },
  quotaFillDanger: { backgroundColor: ParentColors.statusError },
  quotaHint: { ...TextStyle.caption, color: ParentColors.statusWarning },
  version: {
    ...TextStyle.caption,
    color: ParentColors.textTertiary,
    textAlign: 'center',
  },
});
