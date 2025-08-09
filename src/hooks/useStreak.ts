import React, { useState } from 'react';

// --- Data Models (from blueprint) ---
export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate?: Date;
  totalCompletions: number;
}

// --- Mock Data ---
const mockStreak: Streak = {
    currentStreak: 12,
    longestStreak: 25,
    lastCompletionDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    totalCompletions: 150,
};

// --- Custom Hook ---
export const useStreak = () => {
    const [streak, setStreak] = useState<Streak>(mockStreak);

    const handleTaskCompletion = () => {
        // This is where the core streak logic will go.
        // 1. Check if lastCompletionDate is yesterday or today.
        // 2. If yesterday, increment currentStreak.
        // 3. If before yesterday, reset currentStreak to 1.
        // 4. If today, do nothing to the streak count.
        // 5. Update lastCompletionDate to today.
        // 6. Check if currentStreak > longestStreak.
        // 7. Increment totalCompletions.
        // 8. Save to AsyncStorage.
        console.log('A task was completed, streak logic should run here.');
    };

    return {
        streak,
        handleTaskCompletion,
    };
};
