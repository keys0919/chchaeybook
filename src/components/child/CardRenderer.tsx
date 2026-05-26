import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { ChildColors, Spacing, Radius, ComponentSize } from '../../design/tokens';
import { TextStyle, ModeTypography } from '../../design/typography';
import type { Card } from '../../types/card.types';

interface RendererProps {
  card: Card;
  onComplete: (sentences: string[], selectedHints: string[]) => void;
  onSkip: () => void;
  onInputChange?: (text: string) => void;
}

// ── Level 1 (blank): HintChip 선택 ──────────────────────────────────────────
function Level1Renderer({ card, onComplete, onSkip, onInputChange }: RendererProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [skipCount, setSkipCount] = useState(0);

  const handleSelect = (hint: string) => {
    setSelected(hint);
    onInputChange?.(hint);
  };

  const handleComplete = () => {
    if (!selected) return;
    const sentence = card.question.includes('___')
      ? card.question.replace('___', selected)
      : selected;
    onComplete([sentence], [selected]);
  };

  const handleSkip = () => {
    if (skipCount === 0) {
      setSkipCount(1);
      Alert.alert(
        '정말 건너뛸까요?',
        '힌트 중 하나를 골라보는 건 어때요?',
        [
          { text: '계속 해보기', style: 'cancel' },
          { text: '건너뛰기', style: 'destructive', onPress: onSkip },
        ]
      );
    } else {
      onSkip();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.question}>{card.question}</Text>
        <View style={{ height: Spacing.md }} />
        <View style={styles.chipGrid}>
          {card.hints.map((hint) => (
            <TouchableOpacity
              key={hint}
              style={[styles.chip, selected === hint && styles.chipSelected]}
              onPress={() => handleSelect(hint)}
              accessibilityRole="button"
              accessibilityState={{ selected: selected === hint }}
            >
              <Text style={[styles.chipText, selected === hint && styles.chipTextSelected]}>
                {hint}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {selected ? (
          <View style={[styles.previewBox, { marginTop: Spacing.md }]}>
            <Text style={styles.previewText}>
              {card.question.includes('___')
                ? card.question.replace('___', selected)
                : selected}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, !selected && styles.primaryBtnDisabled]}
          onPress={handleComplete}
          disabled={!selected}
        >
          <Text style={styles.primaryBtnText}>완료!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Level 2 (one_sentence): starter + TextInput ──────────────────────────────
function Level2Renderer({ card, onComplete, onSkip, onInputChange }: RendererProps) {
  const [text, setText] = useState('');

  const handleChange = (val: string) => {
    setText(val);
    onInputChange?.(val);
  };

  const handleComplete = () => {
    if (text.trim().length < 1) return;
    const sentence = card.sentence_starter
      ? `${card.sentence_starter} ${text.trim()}`
      : text.trim();
    onComplete([sentence], []);
  };

  const handleSkip = () => {
    Alert.alert('건너뛸까요?', '조금만 더 써볼까요?', [
      { text: '계속 해보기', style: 'cancel' },
      { text: '건너뛰기', style: 'destructive', onPress: onSkip },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.question}>{card.question}</Text>
        <View style={{ height: Spacing.md }} />
        <View style={styles.starterRow}>
          {card.sentence_starter ? (
            <Text style={styles.starterText}>{card.sentence_starter} </Text>
          ) : null}
          <TextInput
            style={styles.inlineInput}
            value={text}
            onChangeText={handleChange}
            placeholder="계속 써보세요"
            placeholderTextColor={ChildColors.textTertiary}
            multiline
            autoFocus
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, text.trim().length < 1 && styles.primaryBtnDisabled]}
          onPress={handleComplete}
          disabled={text.trim().length < 1}
        >
          <Text style={styles.primaryBtnText}>완료!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Level 3 (two_sentence): 순차 2문장 ──────────────────────────────────────
function Level3Renderer({ card, onComplete, onSkip, onInputChange }: RendererProps) {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [step, setStep] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (text1.trim().length < 1) return;
    setStep(2);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const handleComplete = () => {
    if (text2.trim().length < 1) return;
    onComplete([text1.trim(), text2.trim()], []);
  };

  const handleSkip = () => {
    Alert.alert('건너뛸까요?', '두 문장을 모두 써보면 더 좋아요!', [
      { text: '계속 해보기', style: 'cancel' },
      { text: '건너뛰기', style: 'destructive', onPress: onSkip },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.question}>{card.question}</Text>
        <View style={{ height: Spacing.md }} />

        <View style={styles.sentenceBlock}>
          <Text style={styles.sentenceLabel}>첫 번째 문장</Text>
          <TextInput
            style={styles.multilineInput}
            value={text1}
            onChangeText={(v) => { setText1(v); onInputChange?.(v); }}
            placeholder="여기에 써보세요"
            placeholderTextColor={ChildColors.textTertiary}
            multiline
            autoFocus
            editable={step === 1}
          />
        </View>

        {step >= 2 ? (
          <Animated.View style={[styles.sentenceBlock, { opacity: fadeAnim, marginTop: Spacing.md }]}>
            <Text style={styles.sentenceLabel}>두 번째 문장</Text>
            <TextInput
              style={styles.multilineInput}
              value={text2}
              onChangeText={(v) => { setText2(v); onInputChange?.(v); }}
              placeholder="이어서 써보세요"
              placeholderTextColor={ChildColors.textTertiary}
              multiline
              autoFocus
            />
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {step === 1 ? (
          <TouchableOpacity
            style={[styles.primaryBtn, text1.trim().length < 1 && styles.primaryBtnDisabled]}
            onPress={handleNext}
            disabled={text1.trim().length < 1}
          >
            <Text style={styles.primaryBtnText}>다음 문장</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, text2.trim().length < 1 && styles.primaryBtnDisabled]}
            onPress={handleComplete}
            disabled={text2.trim().length < 1}
          >
            <Text style={styles.primaryBtnText}>완료!</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Level 4 (kit): 동적 N문장 키트 (isLocked=false 자리) ────────────────────
// question 첫 줄 = 안내, ①②③④⑤ 줄 = 각 입력 프롬프트
const KIT_MARKERS = ['①','②','③','④','⑤'];

function parseKitLines(question: string): { header: string; prompts: string[] } {
  const lines = question.split('\n');
  const prompts = lines.filter((l) => KIT_MARKERS.some((m) => l.startsWith(m)));
  const header = lines.filter((l) => !KIT_MARKERS.some((m) => l.startsWith(m))).join('\n').trim();
  return { header, prompts: prompts.length > 0 ? prompts : ['첫 번째 문장', '두 번째 문장', '세 번째 문장'] };
}

function Level4Renderer({ card, onComplete, onSkip }: RendererProps) {
  const { header, prompts } = parseKitLines(card.question);
  const [texts, setTexts] = useState<string[]>(() => Array(prompts.length).fill(''));

  const updateText = (idx: number, val: string) => {
    const next = [...texts];
    next[idx] = val;
    setTexts(next);
  };

  const allFilled = texts.every((t) => t.trim().length >= 1);

  const handleComplete = () => {
    if (!allFilled) return;
    onComplete(texts.map((t) => t.trim()), []);
  };

  const handleSkip = () => {
    const n = prompts.length;
    Alert.alert('건너뛸까요?', `${n}문장을 완성해보면 정말 멋질 거예요!`, [
      { text: '계속 해보기', style: 'cancel' },
      { text: '건너뛰기', style: 'destructive', onPress: onSkip },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {header ? <Text style={styles.question}>{header}</Text> : null}
        <View style={{ height: Spacing.md }} />
        {prompts.map((prompt, i) => (
          <View key={i} style={[styles.sentenceBlock, i > 0 && { marginTop: Spacing.sm }]}>
            <Text style={styles.sentenceLabel}>{prompt}</Text>
            <TextInput
              style={styles.multilineInput}
              value={texts[i] ?? ''}
              onChangeText={(v) => updateText(i, v)}
              placeholder="여기에 써보세요"
              placeholderTextColor={ChildColors.textTertiary}
              multiline
            />
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, !allFilled && styles.primaryBtnDisabled]}
          onPress={handleComplete}
          disabled={!allFilled}
        >
          <Text style={styles.primaryBtnText}>완료!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── CardRenderer (분기) ──────────────────────────────────────────────────────
interface CardRendererProps {
  card: Card;
  onComplete: (sentences: string[], selectedHints: string[]) => void;
  onSkip: () => void;
  onInputChange?: (text: string) => void;
}

export function CardRenderer({ card, onComplete, onSkip, onInputChange }: CardRendererProps) {
  const props = { card, onComplete, onSkip, onInputChange };
  switch (card.level) {
    case 2: return <Level2Renderer {...props} />;
    case 3: return <Level3Renderer {...props} />;
    case 4: return <Level4Renderer {...props} />;
    default: return <Level1Renderer {...props} />;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: 20,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  question: { ...ModeTypography.childCardQuestion, color: ChildColors.textPrimary },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    height: ComponentSize.hintChipHeight,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: ChildColors.divider,
    backgroundColor: ChildColors.surface1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: { borderColor: ChildColors.primary, backgroundColor: ChildColors.primaryLight },
  chipText: { ...TextStyle.label, color: ChildColors.textPrimary },
  chipTextSelected: { color: ChildColors.primary },
  previewBox: {
    backgroundColor: ChildColors.primaryLight,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  previewText: { ...TextStyle.body, color: ChildColors.textPrimary, fontWeight: '600' },
  starterRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
  starterText: { ...TextStyle.body, color: ChildColors.textTertiary, lineHeight: 28 },
  inlineInput: {
    flex: 1,
    ...TextStyle.body,
    color: ChildColors.textPrimary,
    lineHeight: 28,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sentenceBlock: {},
  sentenceLabel: { ...TextStyle.caption, color: ChildColors.textSecondary, marginBottom: 4 },
  multilineInput: {
    ...TextStyle.body,
    color: ChildColors.textPrimary,
    borderWidth: 1,
    borderColor: ChildColors.divider,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    minHeight: 72,
    textAlignVertical: 'top',
    backgroundColor: ChildColors.surface2,
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
