import { AsyncStorageService } from './AsyncStorageService';
import { Streak } from '../hooks/useStreak'; // Assuming Streak interface is exported from useStreak hook

const STREAK_STORAGE_KEY = '@RoutineBuddy:streak';

/**
 * Manages all storage operations related to the user's Streak data.
 */
export class StreakStorage {
  /**
   * Retrieves the streak data object from storage.
   * @returns The streak object, or null if not found.
   */
  static async getStreak(): Promise<Streak | null> {
    const streak = await AsyncStorageService.getItem<Streak>(STREAK_STORAGE_KEY);
    // Re-hydrate Date object
    if (streak && streak.lastCompletionDate) {
      return {
        ...streak,
        lastCompletionDate: new Date(streak.lastCompletionDate),
      };
    }
    return streak;
  }

  /**
   * Saves the streak data object to storage.
   * @param streak The streak object to save.
   */
  static async saveStreak(streak: Streak): Promise<void> {
    await AsyncStorageService.setItem(STREAK_STORAGE_KEY, streak);
  }
}
