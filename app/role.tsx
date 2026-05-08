// 0-3 역할 선택 — [부모입니다] → A-1 / [아이입니다] → B-1
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ParentColors, Spacing, Radius, ComponentSize } from '../src/design/tokens';
import { TextStyle, ModeTypography } from '../src/design/typography';

export default function RoleScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>누구로 시작할까요?</Text>
          <Text style={styles.subtitle}>
            역할에 맞게 화면이 달라져요
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => router.push('/onboarding/login')}
            accessibilityLabel="부모입니다"
          >
            <Text style={styles.roleIcon}>📖</Text>
            <Text style={styles.roleTitle}>부모입니다</Text>
            <Text style={styles.roleDesc}>아이의 독서를 함께 기록해요</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, styles.roleCardChild]}
            onPress={() => router.push('/child-experience/')}
            accessibilityLabel="아이입니다"
          >
            <Text style={styles.roleIcon}>✏️</Text>
            <Text style={styles.roleTitle}>아이입니다</Text>
            <Text style={styles.roleDesc}>혼자서 먼저 체험해볼게요</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ParentColors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...TextStyle.heading1,
    color: ParentColors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...TextStyle.body,
    color: ParentColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  buttons: {
    gap: Spacing.md,
  },
  roleCard: {
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: ParentColors.divider,
    minHeight: ComponentSize.buttonHeight * 2,
    justifyContent: 'center',
  },
  roleCardChild: {
    borderColor: ParentColors.primaryLight,
    backgroundColor: '#FFFAF8',
  },
  roleIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  roleTitle: {
    ...TextStyle.title,
    color: ParentColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  roleDesc: {
    ...TextStyle.label,
    color: ParentColors.textSecondary,
    textAlign: 'center',
  },
});
