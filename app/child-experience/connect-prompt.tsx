// B-3 부모 연결 유도 — 기록 병합 없이 로컬 보관 안내
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChildColors, ParentColors, Spacing, Radius, ComponentSize, Shadow } from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';

export default function ConnectPromptScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconArea}>
          <Text style={styles.icon}>📬</Text>
        </View>

        <Text style={styles.heading}>잘 썼어요!</Text>
        <Text style={styles.desc}>
          부모님께 알려주면{'\n'}기록을 함께 볼 수 있어요
        </Text>

        <View style={{ height: Spacing.lg }} />

        {/* 안내 카드 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>체험 기록 안내</Text>
          <Text style={styles.infoDesc}>
            지금 쓴 기록은 이 기기에만 저장돼요.{'\n'}
            부모님이 앱에 가입하면 함께 볼 수 있어요.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/role')}
            accessibilityLabel="부모님과 함께 시작하기"
          >
            <Text style={styles.primaryButtonText}>부모님과 함께 시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() => router.replace('/child-experience/card')}
            accessibilityLabel="한 장 더 체험하기"
          >
            <Text style={styles.tertiaryText}>한 장 더 체험하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  container: {
    flex: 1,
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  iconArea: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  icon: { fontSize: 64 },
  heading: { ...TextStyle.heading1, color: ChildColors.textPrimary, textAlign: 'center' },
  desc: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 24,
  },
  infoCard: {
    width: '100%',
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.level1,
    shadowColor: '#000',
    borderWidth: 1,
    borderColor: ChildColors.divider,
  },
  infoTitle: { ...TextStyle.label, color: ChildColors.textPrimary, marginBottom: Spacing.xs },
  infoDesc: { ...TextStyle.body, color: ChildColors.textSecondary, lineHeight: 24 },
  buttons: {
    width: '100%',
    gap: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  primaryButton: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
  tertiaryButton: {
    height: ComponentSize.touchTargetParent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tertiaryText: { ...TextStyle.label, color: ChildColors.textSecondary },
});
