// 14_ui_contract 기준 디자인 토큰
// base-hybrid (Toss Structure × Karrot Warmth) 계승

// ─────────────────────────────────────────
// Base Palette (직접 사용 금지 — 시맨틱 토큰 매핑 전용)
// ─────────────────────────────────────────
export const BasePalette = {
  warmWhite: '#FAFAF7',
  pureWhite: '#FFFFFF',
  gray50: '#F5F5F3',
  gray100: '#EBEBEA',
  gray200: '#D6D6D4',
  gray300: '#ABABAA',
  gray400: '#808080',
  gray500: '#5C5C5C',
  gray700: '#2E2E2E',
  gray900: '#1A1A1A',

  booksokMain: '#FF7340',
  booksokMainLight: '#FFD4C2',
  booksokMainDark: '#D45A28',
  booksokAccent: '#3D6FFF',
  booksokAccentLight: '#C8D8FF',
} as const;

// ─────────────────────────────────────────
// Semantic Color Tokens
// ─────────────────────────────────────────
export const ParentColors = {
  background: '#FFFFFF',
  surface1: '#F5F5F3',
  surface2: '#EBEBEA',
  primary: '#FF7340',
  primaryLight: '#FFD4C2',
  primaryDark: '#D45A28',
  textOnPrimary: '#FFFFFF',
  divider: '#D6D6D4',
  dividerStrong: '#ABABAA',
  textPrimary: '#1A1A1A',
  textSecondary: '#5C5C5C',
  textTertiary: '#808080',
  statusSuccess: '#00B493',
  statusWarning: '#FF9500',
  statusError: '#FF4D4F',
  statusInfo: '#3182F6',
} as const;

export const ChildColors = {
  ...ParentColors,
  background: '#FAFAF7',
  surface1: '#FFFFFF',
  surface2: '#F5F5F3',
  divider: '#EBEBEA',
  textSecondary: '#5C5C5C',
  textStarter: '#ABABAA',  // --booksok-text-starter (아이 모드 전용)
} as const;

// ─────────────────────────────────────────
// Spacing (base unit: 4dp)
// ─────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

// ─────────────────────────────────────────
// Border Radius
// ─────────────────────────────────────────
export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
} as const;

// ─────────────────────────────────────────
// Shadow (base-hybrid Level 토큰)
// ─────────────────────────────────────────
export const Shadow = {
  level0: undefined,
  level1: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  level2: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  level3: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

// D-4 완성 카드 warm shadow (iOS 전용)
export const WarmShadow = {
  shadowColor: 'rgba(255,115,64,0.08)',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 8,
  elevation: 3,
} as const;

// ─────────────────────────────────────────
// Motion (duration + easing)
// ─────────────────────────────────────────
export const Duration = {
  instant: 100,
  fast: 150,
  base: 250,
  slow: 400,
} as const;

// Note: easing은 Animated/Reanimated에서 문자열로 전달
export const Easing = {
  default: 'cubic-bezier(0.2, 0, 0, 1)',
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ─────────────────────────────────────────
// Z-index Scale
// ─────────────────────────────────────────
export const ZIndex = {
  base: 0,
  card: 1,
  sticky: 10,
  toast: 50,
  scrim: 99,
  modal: 100,
  overlay: 200,
} as const;

// ─────────────────────────────────────────
// Component Dimensions
// ─────────────────────────────────────────
export const ComponentSize = {
  buttonHeight: 52,
  inputHeight: 52,
  tabBarHeight: 56,
  topBarHeight: 56,
  touchTargetParent: 44,
  touchTargetChild: 52,
  hintChipHeight: 44,
  stampBadgeLarge: 64,
  stampBadgeMedium: 52,
  stampBadgeSmall: 20,
  praiseCardHeight: 120,
  recordingWaveformHeight: 48,
  dragHandleWidth: 36,
  dragHandleHeight: 4,
  badgeHeight: 22,
  badgePaddingH: 8,
} as const;

// ─────────────────────────────────────────
// Copy Tokens (마이크로카피 고정값)
// ─────────────────────────────────────────
export const CopyTokens = {
  EMPTY_CHILD_HOME: '오늘은 어떤 책을 읽었어요?',
  EMPTY_BOOKSHELF: '첫 책을 기록해볼까요?',
  EMPTY_STAMP: '첫 문장을 쓰면 도장을 받을 수 있어요',
  EMPTY_PARENT_RECORD: '아직 기록이 없어요. 아이가 첫 문장을 쓰면 여기에 표시돼요',
  EMPTY_PARENT_HOME: '지금 아이 모드로 전환해서 첫 문장을 써볼까요?',
  SKIP_NUDGE_2X: '이 카드가 마음에 안 들어요?',
  SKIP_ALL: '오늘은 여기까지 해볼까요?',
  DRAFT_EXPIRE: '{n}일 후 사라져요',
  PRAISE_SENT: '칭찬을 보냈어요!',
  SAVE_COMPLETE: '저장됐어요',
  UPLOAD_RETRY: '업로드를 다시 시도해볼까요?',
  STAMP_TEXTS: [
    '한 문장을 끝까지 썼어요!',
    '네 생각이 담긴 문장이에요',
    '오늘도 한 문장 완성!',
    '멋진 문장이에요',
    '차곡차곡 쌓이고 있어요',
  ],
  LEVEL4_UPSELL: '짧은 독서록을 완성했어요! 전체 키트를 열어볼까요?',
  STORAGE_LIMIT: '사진/녹음이 30개 가득 찼어요.',
  STORAGE_OVERWRITE: '가장 오래된 기록이 삭제되고 새 기록이 저장됩니다.',
  ALBUM_TEASER: '기록이 3개 이상 쌓이면 이달의 인화를 볼 수 있어요.',
  QUIT_SAVE: '지금까지 쓴 내용을 저장할까요?',
  SKIP_NUDGE_OPTION1: '다른 카드 볼게요',
  SKIP_NUDGE_OPTION2: '계속 해볼게요',
  MODE_SWITCH_COACH: '이 버튼으로 다시 돌아올 수 있어요',
} as const;
