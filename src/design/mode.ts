// 14_ui_contract 8장 모드별 토큰 매핑
// 부모/아이 모드 전환 시 이 매핑을 사용

import { ParentColors, ChildColors, Radius, Shadow, ComponentSize } from './tokens';

export type AppMode = 'parent' | 'child';

export const ModeTokens = {
  parent: {
    colors: ParentColors,
    card: {
      radius: Radius.md,        // 14px
      padding: 16,
      shadow: Shadow.level1,
    },
    button: {
      radius: Radius.md,        // 14px
    },
    chip: {
      radius: Radius.sm,        // 10px
    },
    modal: {
      radius: Radius.xl,        // 24px
    },
    tabBar: {
      iconSize: ComponentSize.touchTargetParent,   // 24px
      labelSize: 12,
      labelWeight: '500' as const,
    },
    touchTarget: ComponentSize.touchTargetParent,  // 44px
    useIllustration: false,
    useSpring: false,
  },
  child: {
    colors: ChildColors,
    card: {
      radius: Radius.lg,        // 18px
      padding: 20,
      shadow: Shadow.level1,
    },
    button: {
      radius: Radius.md,        // 14px (동일)
    },
    chip: {
      radius: Radius.full,      // pill
    },
    modal: {
      radius: Radius.xl,        // 24px (동일)
    },
    tabBar: {
      iconSize: 28,
      labelSize: 14,
      labelWeight: '500' as const,
    },
    touchTarget: ComponentSize.touchTargetChild,   // 52px
    useIllustration: true,
    useSpring: true,             // D-4 도장·완성 카드에만 제한적 허용
  },
} as const;

export function getModeTokens(mode: AppMode) {
  return ModeTokens[mode];
}

export function getModeColors(mode: AppMode) {
  return ModeTokens[mode].colors;
}
