import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

function goalKey(childId: string) {
  return `booksok_weekly_goal_${childId}`;
}

interface GoalStore {
  weeklyGoal: number;
  loadGoal: (childId: string) => Promise<void>;
  setWeeklyGoal: (childId: string, goal: number) => Promise<void>;
}

export const useGoalStore = create<GoalStore>((set) => ({
  weeklyGoal: 3,
  loadGoal: async (childId) => {
    const stored = await SecureStore.getItemAsync(goalKey(childId));
    if (stored) set({ weeklyGoal: parseInt(stored, 10) });
  },
  setWeeklyGoal: async (childId, goal) => {
    await SecureStore.setItemAsync(goalKey(childId), String(goal));
    set({ weeklyGoal: goal });
  },
}));
