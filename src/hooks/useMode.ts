import { useModeStore } from '../stores/mode.store';
import { getModeTokens, getModeColors } from '../design/mode';

export function useMode() {
  const { mode, setMode, toggleMode } = useModeStore();
  const tokens = getModeTokens(mode);
  const colors = getModeColors(mode);

  return {
    mode,
    isParent: mode === 'parent',
    isChild: mode === 'child',
    tokens,
    colors,
    setMode,
    toggleMode,
  };
}
