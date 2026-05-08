// A-1 로그인 — Kakao / Google / Apple(iOS only)
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ParentColors, Spacing, Radius, ComponentSize } from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';
import {
  signInWithKakao,
  signInWithGoogle,
  signInWithApple,
} from '../../src/services/auth.service';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAuth(provider: 'kakao' | 'google' | 'apple') {
    setLoading(provider);
    setError(null);
    try {
      if (provider === 'kakao') await signInWithKakao();
      if (provider === 'google') await signInWithGoogle();
      if (provider === 'apple') await signInWithApple();
      // auth 상태 변경은 _layout의 onAuthStateChange에서 처리
      // 로그인 성공 후 닉네임 입력으로 이동
      router.replace('/onboarding/nickname');
    } catch (e: any) {
      setError(e.message ?? '로그인 중 문제가 생겼어요. 다시 시도해주세요.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoArea}>
          <Text style={styles.logoText}>📚</Text>
          <Text style={styles.appName}>책쏙</Text>
          <Text style={styles.appDesc}>한 문장의 독서 기록</Text>
        </View>

        <View style={styles.buttons}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.kakaoButton}
            onPress={() => handleAuth('kakao')}
            disabled={!!loading}
            accessibilityLabel="카카오로 시작하기"
          >
            {loading === 'kakao' ? (
              <ActivityIndicator color="#1A1A1A" />
            ) : (
              <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => handleAuth('google')}
            disabled={!!loading}
            accessibilityLabel="Google로 시작하기"
          >
            {loading === 'google' ? (
              <ActivityIndicator color={ParentColors.textPrimary} />
            ) : (
              <Text style={styles.googleButtonText}>Google로 시작하기</Text>
            )}
          </TouchableOpacity>

          {Platform.OS === 'ios' ? (
            <TouchableOpacity
              style={styles.appleButton}
              onPress={() => handleAuth('apple')}
              disabled={!!loading}
              accessibilityLabel="Apple로 시작하기"
            >
              {loading === 'apple' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.appleButtonText}>Apple로 시작하기</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.agreeText}>
          시작하면 서비스 이용약관 및 개인정보 처리방침에 동의한 것으로 간주돼요
        </Text>
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
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoText: {
    fontSize: 60,
    marginBottom: Spacing.sm,
  },
  appName: {
    ...TextStyle.heading1,
    color: ParentColors.textPrimary,
  },
  appDesc: {
    ...TextStyle.body,
    color: ParentColors.textSecondary,
    marginTop: Spacing.xs,
  },
  buttons: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  errorText: {
    ...TextStyle.label,
    color: ParentColors.statusError,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  kakaoButton: {
    height: ComponentSize.buttonHeight,
    backgroundColor: '#FEE500',
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kakaoButtonText: {
    ...ModeTypography.buttonLabel,
    color: '#1A1A1A',
  },
  googleButton: {
    height: ComponentSize.buttonHeight,
    borderWidth: 1.5,
    borderColor: ParentColors.divider,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ParentColors.background,
  },
  googleButtonText: {
    ...ModeTypography.buttonLabel,
    color: ParentColors.textPrimary,
  },
  appleButton: {
    height: ComponentSize.buttonHeight,
    backgroundColor: '#000000',
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleButtonText: {
    ...ModeTypography.buttonLabel,
    color: '#FFFFFF',
  },
  agreeText: {
    ...TextStyle.caption,
    color: ParentColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
