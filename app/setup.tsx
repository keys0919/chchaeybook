// 최초 실행 — 닉네임 입력
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../src/stores/profile.store';
import { ChildColors, Spacing, Radius, ComponentSize } from '../src/design/tokens';
import { TextStyle, ModeTypography } from '../src/design/typography';

export default function SetupScreen() {
  const router = useRouter();
  const { createProfile } = useProfileStore();
  const [nickname, setNickname] = useState('');

  const handleStart = () => {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    createProfile(trimmed);
    router.replace('/(child)/today');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>📚</Text>
          <Text style={styles.title}>책쏙에 오신 걸 환영해요!</Text>
          <Text style={styles.desc}>이름을 알려주세요.</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="이름 입력"
            placeholderTextColor={ChildColors.textTertiary}
            maxLength={10}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />
          <TouchableOpacity
            style={[styles.btn, !nickname.trim() && styles.btnDisabled]}
            onPress={handleStart}
            disabled={!nickname.trim()}
          >
            <Text style={styles.btnText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  flex: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
  },
  emoji: { fontSize: 64, marginBottom: Spacing.sm },
  title: { ...TextStyle.heading1, color: ChildColors.textPrimary, textAlign: 'center' },
  desc: { ...TextStyle.body, color: ChildColors.textSecondary, textAlign: 'center' },
  input: {
    width: '100%',
    height: ComponentSize.buttonHeight,
    borderWidth: 1.5,
    borderColor: ChildColors.divider,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    ...TextStyle.body,
    color: ChildColors.textPrimary,
    backgroundColor: ChildColors.surface1,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  btn: {
    width: '100%',
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.38 },
  btnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
});
