import { create } from 'zustand';

interface OnboardingStore {
  nickname: string;
  grade: string | null;
  assessmentLevel: number;
  selectedLevel: number;
  setNickname: (nickname: string) => void;
  setGrade: (grade: string | null) => void;
  setAssessmentLevel: (level: number) => void;
  setSelectedLevel: (level: number) => void;
  reset: () => void;
}

const gradeToLevel: Record<string, number> = {
  '1학년': 1,
  '2학년': 1,
  '3학년': 2,
  '4학년': 2,
  '5학년': 3,
  '6학년': 3,
};

export function deriveLevelFromGradeAndAssessment(grade: string | null, assessmentLevel: number): number {
  if (grade && gradeToLevel[grade]) {
    const gradeLevel = gradeToLevel[grade];
    return Math.max(gradeLevel, assessmentLevel);
  }
  return assessmentLevel;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  nickname: '',
  grade: null,
  assessmentLevel: 1,
  selectedLevel: 1,
  setNickname: (nickname) => set({ nickname }),
  setGrade: (grade) => set({ grade }),
  setAssessmentLevel: (assessmentLevel) => set({ assessmentLevel }),
  setSelectedLevel: (selectedLevel) => set({ selectedLevel }),
  reset: () => set({ nickname: '', grade: null, assessmentLevel: 1, selectedLevel: 1 }),
}));
