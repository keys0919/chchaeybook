// C-18 개인정보 처리방침 · 탈퇴
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ParentColors, Spacing, Radius } from '../../../src/design/tokens';
import { TextStyle } from '../../../src/design/typography';
import { useAuthStore } from '../../../src/stores/auth.store';
import { supabase } from '../../../src/services/supabase';

const PRIVACY_ITEMS = [
  { title: '수집하는 개인정보', body: '이메일, 자녀 닉네임·학년·독서 기록, 사진·녹음 (선택)' },
  { title: '이용 목적', body: '독서 기록 저장 및 부모·자녀 공유, 서비스 품질 개선' },
  { title: '보유 기간', body: '회원 탈퇴 후 30일 이내 파기. 법령에 따른 보관 항목 제외.' },
  { title: '제3자 제공', body: '사용자 동의 없이 외부 제공 없음. Supabase 클라우드 인프라 사용.' },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const { signOut } = useAuthStore();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정을 삭제하시겠어요?',
      '모든 기록과 데이터가 영구 삭제됩니다. 이 작업은 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const { error } = await supabase.rpc('delete_user_account');
              if (error) throw error;
              signOut();
            } catch {
              Alert.alert('탈퇴에 실패했어요. 고객센터에 문의해주세요.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보 · 탈퇴</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>개인정보 처리방침</Text>
        <View style={{ height: Spacing.sm }} />

        {PRIVACY_ITEMS.map((item, i) => (
          <View key={i} style={styles.privacyCard}>
            <Text style={styles.privacyTitle}>{item.title}</Text>
            <Text style={styles.privacyBody}>{item.body}</Text>
          </View>
        ))}

        <View style={{ height: Spacing.xl }} />

        <Text style={styles.sectionTitle}>회원 탈퇴</Text>
        <Text style={styles.withdrawDesc}>
          탈퇴 시 모든 독서 기록, 사진, 녹음이 영구 삭제돼요.
          서버에 공유된 미디어는 30일 이내에 파기됩니다.
        </Text>

        <View style={{ height: Spacing.lg }} />

        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color={ParentColors.statusError} size="small" />
          ) : (
            <Text style={styles.withdrawBtnText}>계정 삭제</Text>
          )}
        </TouchableOpacity>
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
  sectionTitle: { ...TextStyle.heading2, color: ParentColors.textPrimary, marginBottom: Spacing.sm },
  privacyCard: {
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: ParentColors.divider,
    gap: 6,
  },
  privacyTitle: { ...TextStyle.label, color: ParentColors.textPrimary, fontWeight: '700' },
  privacyBody: { ...TextStyle.body, color: ParentColors.textSecondary, lineHeight: 22 },
  withdrawDesc: {
    ...TextStyle.body,
    color: ParentColors.textSecondary,
    lineHeight: 22,
  },
  withdrawBtn: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: ParentColors.statusError,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawBtnText: { ...TextStyle.label, color: ParentColors.statusError, fontWeight: '700' },
});
