// 14_ui_contract 2장 Typography Scale 기준
// 폰트 패밀리: Pretendard (단일 패밀리)
// 예외: D-4 완성 카드 문장만 --booksok-font-handwriting (Nanum Pen Script / Gaegu)

import { Platform } from 'react-native';

export const FontFamily = {
  regular: Platform.select({
    ios: 'Pretendard-Regular',
    android: 'Pretendard-Regular',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'Pretendard-Medium',
    android: 'Pretendard-Medium',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'Pretendard-SemiBold',
    android: 'Pretendard-SemiBold',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'Pretendard-Bold',
    android: 'Pretendard-Bold',
    default: 'System',
  }),
  // D-4 완성 카드 문장 전용 필기체 폰트
  handwriting: Platform.select({
    ios: 'NanumPenScript',
    android: 'NanumPenScript',
    default: 'serif',
  }),
} as const;

// base-hybrid scale
export const TextStyle = {
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 12 * 1.4,
    letterSpacing: 0.2,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 14 * 1.5,
    letterSpacing: 0,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 16 * 1.6,
    letterSpacing: 0,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 18 * 1.5,
    letterSpacing: 0,
  },
  heading2: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 20 * 1.4,
    letterSpacing: -0.2,
  },
  heading1: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 24 * 1.3,
    letterSpacing: -0.3,
  },
  // 책쏙 전용 확장
  stampText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    fontWeight: '700' as const,
    lineHeight: 11 * 1.2,
    letterSpacing: 0.2,
  },
} as const;

// 모드별 Typography 운영 (14_ui_contract 2장)
export const ModeTypography = {
  // D-3 카드 질문 텍스트 override (아이 모드 전용)
  childCardQuestion: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 24 * 1.3,
    letterSpacing: -0.3,
  },
  // D-4 완성 문장 (필기체)
  completionSentence: {
    fontFamily: FontFamily.handwriting,
    fontSize: 18,
    lineHeight: 18 * 1.6,
    letterSpacing: 0,
  },
  // CTA 버튼 레이블 (공통)
  buttonLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 16 * 1.5,
  },
  // 아이 모드 힌트 텍스트
  childHint: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 16 * 1.6,
  },
} as const;
