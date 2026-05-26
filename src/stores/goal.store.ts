import { create } from 'zustand';

const GOAL_KEY = 'booksok_weekly_goal';

interface GoalStore {
  weeklyGoal: number;
  loadGoal: () => void;
  setWeeklyGoal: (goal: number) => void;
}

export const useGoalStore = create<GoalStore>((set) => ({
  weeklyGoal: 3,
  loadGoal: () => {
    const stored = localStorage.getItem(GOAL_KEY);
    if (stored) set({ weeklyGoal: parseInt(stored, 10) });
  },
  setWeeklyGoal: (goal) => {
    localStorage.setItem(GOAL_KEY, String(goal));
    set({ weeklyGoal: goal });
  },
}));
