import { AsyncStorageService } from './AsyncStorageService';
import { MoodEntry } from '../hooks/useMood'; // Assuming MoodEntry interface is exported from useMood hook

const MOOD_STORAGE_KEY = '@RoutineBuddy:moods';

/**
 * Manages all storage operations related to Mood Entries.
 */
export class MoodStorage {
  /**
   * Retrieves all mood entries from storage.
   * @returns An array of mood entries, or an empty array if none are found.
   */
  static async getMoods(): Promise<MoodEntry[]> {
    const moods = await AsyncStorageService.getItem<MoodEntry[]>(MOOD_STORAGE_KEY);
    // Re-hydrate Date objects
    if (moods) {
      return moods.map(mood => ({
        ...mood,
        date: new Date(mood.date),
      }));
    }
    return [];
  }

  /**
   * Saves the entire array of mood entries to storage.
   * @param moods The array of mood entries to save.
   */
  static async saveMoods(moods: MoodEntry[]): Promise<void> {
    await AsyncStorageService.setItem(MOOD_STORAGE_KEY, moods);
  }
}
