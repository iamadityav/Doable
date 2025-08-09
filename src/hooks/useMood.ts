import React, { useState } from 'react';

// --- Data Models (from blueprint) ---
export interface MoodEntry {
  id: string;
  emoji: string;
  label: string;
  date: Date;
  note?: string;
}

// --- Mock Data ---
const mockMoods: MoodEntry[] = [
    { id: 'm1', emoji: '😊', label: 'Happy', date: new Date(new Date().setDate(new Date().getDate() - 1)) },
    { id: 'm2', emoji: '😐', label: 'Neutral', date: new Date(new Date().setDate(new Date().getDate() - 2)) },
];

// --- Custom Hook ---
export const useMood = () => {
    const [moods, setMoods] = useState<MoodEntry[]>(mockMoods);

    const addMoodEntry = (entry: Omit<MoodEntry, 'id' | 'date'>) => {
        // const newEntry = { ...entry, id: uuid.v4(), date: new Date() };
        // setMoods(prev => [newEntry, ...prev]);
        console.log('Adding new mood entry:', entry);
    };

    const getMoodForDate = (date: Date) => {
        return moods.find(mood => mood.date.toDateString() === date.toDateString());
    };
    
    // TODO: Load/save moods from AsyncStorage

    return {
        moods,
        addMoodEntry,
        getMoodForDate,
    };
};
