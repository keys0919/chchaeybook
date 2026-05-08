// D-3 카드 화면 — CardRenderer + Draft Core + 사진/녹음 모드 연동
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ChildColors, Spacing, Radius, ComponentSize } from '../../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../../src/design/typography';
import { useSessionStore } from '../../../src/stores/session.store';
import { useAuthStore } from '../../../src/stores/auth.store';
import { CardRenderer } from '../../../src/components/child/CardRenderer';
import { InputModeToggle } from '../../../src/components/child/InputModeToggle';
import { RecordingWaveform } from '../../../src/components/child/RecordingWaveform';
import { TimerCircle } from '../../../src/components/child/TimerCircle';
import { useDraft } from '../../../src/hooks/useDraft';
import { useCard, logCardUsage } from '../../../src/hooks/useCard';
import { useRecording } from '../../../src/hooks/useRecording';
import { useSubscriptionStore } from '../../../src/stores/subscription.store';
import type { CardInputMode } from '../../../src/types/card.types';

export default function CardScreen() {
  const router = useRouter();
  const { session, setCard, setSentences, setSelectedHints, setInputMode, setMediaTemp } =
    useSessionStore();
  const { childProfile } = useAuthStore();
  const { isPaid } = useSubscriptionStore();

  const level = session?.level ?? 1;
  const childId = childProfile?.child_id ?? '';

  const [activeMode, setActiveMode] = useState<CardInputMode>('text');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Level 4는 프리미엄 전용
  const showLevel4Lock = level === 4 && !isPaid;

  const recording = useRecording();

  const { card: fetchedCard, loading, error } = useCard(level, childId, null);

  useEffect(() => {
    if (fetchedCard && session && !session.card) {
      setCard(fetchedCard);
      if (childId) logCardUsage(childId, fetchedCard.card_id).catch(() => {});
    }
  }, [fetchedCard, session, childId, setCard]);

  const card = session?.card ?? fetchedCard;

  const { scheduleSave } = useDraft({
    draftId: session?.draftId ?? 'tmp',
    childId,
    bookTitle: session?.bookTitle ?? '',
    level,
    cardId: card?.card_id ?? '',
    cardType: card?.type ?? 'blank',
  });

  const handleModeChange = (mode: CardInputMode) => {
    if (mode === activeMode) return;
    if (activeMode !== 'text' || photoUri || recording.status !== 'idle') {
      Alert.alert(
        '입력 방식을 바꿀까요?',
        '지금 입력한 내용이 사라져요.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '바꾸기',
            onPress: () => {
              setPhotoUri(null);
              if (recording.status === 'recording') recording.cancelRecording();
              else recording.reset();
              setActiveMode(mode);
              setInputMode(mode);
            },
          },
        ]
      );
    } else {
      setActiveMode(mode);
      setInputMode(mode);
    }
  };

  const handleTextComplete = (sentences: string[], selectedHints: string[]) => {
    setSentences(sentences);
    setSelectedHints(selectedHints);
    setMediaTemp(null, null);
    router.push('/write/complete');
  };

  const handleSkip = () => router.replace('/today');

  const handleInputChange = (text: string) => {
    scheduleSave({ type: 'text', text });
  };

  const handlePickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요해요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      scheduleSave({ type: 'photo', photo_path: uri });
    }
  };

  const handleTakePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요해요.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      scheduleSave({ type: 'photo', photo_path: uri });
    }
  };

  const handlePhotoComplete = () => {
    if (!photoUri) return;
    setSentences([]);
    setSelectedHints([]);
    setMediaTemp(photoUri, 'photo');
    router.push('/write/complete');
  };

  const handleStartRecording = async () => {
    const ok = await recording.startRecording();
    if (!ok) Alert.alert('권한 필요', '마이크 접근 권한이 필요해요.');
  };

  const handleStopRecording = async () => {
    const uri = await recording.stopRecording();
    if (uri) scheduleSave({ type: 'voice', voice_path: uri });
  };

  const handleVoiceComplete = () => {
    if (!recording.recordedUri) return;
    setSentences([]);
    setSelectedHints([]);
    setMediaTemp(recording.recordedUri, 'voice');
    router.push('/write/complete');
  };

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>세션 정보가 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showLevel4Lock) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.lockOverlay}>
          <Text style={styles.lockEmoji}>🔒</Text>
          <Text style={styles.lockTitle}>Level 4는 프리미엄 전용이에요</Text>
          <Text style={styles.lockDesc}>
            심화 독후감 카드는 책쏙 프리미엄{'\n'}구독자만 사용할 수 있어요.
          </Text>
          <TouchableOpacity
            style={styles.lockPrimaryBtn}
            onPress={() => router.push('/(parent)/paywall' as any)}
          >
            <Text style={styles.lockPrimaryBtnText}>프리미엄 구독하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lockSecondaryBtn} onPress={() => router.replace('/today')}>
            <Text style={styles.lockSecondaryBtnText}>홈으로</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading || !card) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <ActivityIndicator color={ChildColors.primary} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const availableModes = card.input_modes ?? ['text'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.metaRow}>
          <Text style={styles.metaBook} numberOfLines={1}>{session.bookTitle}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {level}</Text>
          </View>
        </View>

        {availableModes.length > 1 ? (
          <>
            <View style={{ height: Spacing.sm }} />
            <InputModeToggle
              activeMode={activeMode}
              availableModes={availableModes}
              onChangeMode={handleModeChange}
            />
          </>
        ) : null}

        <View style={{ height: Spacing.md }} />

        {/* 텍스트 모드 */}
        {activeMode === 'text' ? (
          <CardRenderer
            card={card}
            onComplete={handleTextComplete}
            onSkip={handleSkip}
            onInputChange={handleInputChange}
          />
        ) : null}

        {/* 사진 모드 */}
        {activeMode === 'photo' ? (
          <View style={styles.mediaCard}>
            <Text style={styles.cardQuestion}>{card.question}</Text>
            <View style={{ height: Spacing.md }} />

            {photoUri ? (
              <View style={styles.photoPreviewWrap}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
                <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickPhoto}>
                  <Text style={styles.changePhotoText}>다른 사진 선택</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
                  <Text style={styles.photoBtnIcon}>📷</Text>
                  <Text style={styles.photoBtnText}>촬영</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto}>
                  <Text style={styles.photoBtnIcon}>🖼</Text>
                  <Text style={styles.photoBtnText}>라이브러리</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.primaryBtn, !photoUri && styles.primaryBtnDisabled]}
                onPress={handlePhotoComplete}
                disabled={!photoUri}
              >
                <Text style={styles.primaryBtnText}>완료!</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>건너뛰기</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* 녹음 모드 */}
        {activeMode === 'voice' ? (
          <View style={styles.mediaCard}>
            <Text style={styles.cardQuestion}>{card.question}</Text>
            <View style={{ height: Spacing.lg }} />

            <View style={styles.waveformRow}>
              <RecordingWaveform
                metering={recording.metering}
                isRecording={recording.status === 'recording'}
              />
              {recording.status !== 'idle' ? (
                <TimerCircle elapsed={recording.elapsed} />
              ) : null}
            </View>

            <View style={{ height: Spacing.md }} />

            {recording.status === 'done' ? (
              <View style={styles.recordDoneRow}>
                <Text style={styles.recordDoneText}>✓ 녹음 완료 ({recording.elapsed}초)</Text>
                <TouchableOpacity onPress={() => { recording.reset(); }}>
                  <Text style={styles.reRecordText}>다시 녹음</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {recording.status !== 'done' ? (
              recording.status === 'idle' ? (
                <TouchableOpacity style={styles.recordBtn} onPress={handleStartRecording}>
                  <Text style={styles.recordBtnIcon}>🎙</Text>
                  <Text style={styles.recordBtnText}>녹음 시작</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.recordBtn, styles.recordBtnActive]} onPress={handleStopRecording}>
                  <View style={styles.stopIcon} />
                  <Text style={styles.recordBtnText}>중지</Text>
                </TouchableOpacity>
              )
            ) : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.primaryBtn, recording.status !== 'done' && styles.primaryBtnDisabled]}
                onPress={handleVoiceComplete}
                disabled={recording.status !== 'done'}
              >
                <Text style={styles.primaryBtnText}>완료!</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>건너뛰기</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  lockOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.md,
  },
  lockEmoji: { fontSize: 56, marginBottom: Spacing.sm },
  lockTitle: { ...TextStyle.heading2, color: ChildColors.textPrimary, textAlign: 'center' },
  lockDesc: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  lockPrimaryBtn: {
    width: '100%',
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  lockPrimaryBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
  lockSecondaryBtn: {
    height: ComponentSize.touchTargetChild,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockSecondaryBtnText: { ...TextStyle.label, color: ChildColors.textSecondary },
  scroll: { flex: 1 },
  content: { padding: Spacing['2xl'], paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  metaBook: { ...TextStyle.caption, color: ChildColors.textSecondary, flex: 1 },
  levelBadge: {
    backgroundColor: '#C8D8FF',
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelBadgeText: { ...TextStyle.caption, color: '#3D6FFF' },
  errorText: { ...TextStyle.body, color: ChildColors.textSecondary },
  mediaCard: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardQuestion: { ...TextStyle.heading2, color: ChildColors.textPrimary },
  photoButtons: { flexDirection: 'row', gap: Spacing.md, justifyContent: 'center' },
  photoBtn: {
    flex: 1,
    height: 100,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: ChildColors.divider,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: ChildColors.surface2,
  },
  photoBtnIcon: { fontSize: 28 },
  photoBtnText: { ...TextStyle.label, color: ChildColors.textSecondary },
  photoPreviewWrap: { alignItems: 'center', gap: Spacing.sm },
  photoPreview: { width: '100%', height: 200, borderRadius: Radius.md },
  changePhotoBtn: { paddingVertical: 4 },
  changePhotoText: { ...TextStyle.label, color: ChildColors.primary },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  recordDoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  recordDoneText: { ...TextStyle.label, color: ChildColors.primary },
  reRecordText: { ...TextStyle.label, color: ChildColors.textSecondary },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: ComponentSize.buttonHeight,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: ChildColors.primary,
    backgroundColor: ChildColors.primaryLight,
  },
  recordBtnActive: {
    backgroundColor: '#FFE8E8',
    borderColor: '#FF5C5C',
  },
  recordBtnIcon: { fontSize: 20 },
  recordBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.primary },
  stopIcon: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#FF5C5C',
  },
  actions: { marginTop: Spacing.lg, gap: Spacing.xs },
  primaryBtn: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.38 },
  primaryBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
  skipBtn: {
    height: ComponentSize.touchTargetChild,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: { ...TextStyle.label, color: ChildColors.textSecondary },
});
