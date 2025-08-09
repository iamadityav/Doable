import { isToday, isYesterday, differenceInCalendarDays } from 'date-fns';
import { Streak } from '../hooks/useStreak'; // Assuming Streak interface is exported from useStreak hook

/**
 * A utility class to handle all streak-related calculations.
 * This class contains pure functions and does not manage state.
 */
export class StreakCalculator {
  /**
   * Calculates the updated streak state based on a new task completion.
   * @param currentStreak The current streak data.
   * @param completionDate The date of the new completion (typically today).
   * @returns The newly calculated streak data.
   */
  static updateStreakOnCompletion(
    currentStreak: Streak,
    completionDate: Date = new Date()
  ): Streak {
    const {
      currentStreak: count,
      longestStreak,
      lastCompletionDate,
      totalCompletions,
    } = currentStreak;

    const newTotalCompletions = totalCompletions + 1;
    let newCurrentStreak = count;
    let newLongestStreak = longestStreak;

    // If there's no previous completion, start a new streak.
    if (!lastCompletionDate) {
      newCurrentStreak = 1;
    } else {
      const lastDate = new Date(lastCompletionDate);

      // If the last completion was today, the streak count doesn't change.
      if (isToday(lastDate)) {
        // No change to streak count, just update total completions.
        return { ...currentStreak, totalCompletions: newTotalCompletions };
      }

      // If the last completion was yesterday, continue the streak.
      if (isYesterday(lastDate)) {
        newCurrentStreak += 1;
      } 
      // If the last completion was before yesterday, reset the streak.
      else if (differenceInCalendarDays(completionDate, lastDate) > 1) {
        newCurrentStreak = 1;
      }
    }

    // Update the longest streak if the new streak is greater.
    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }

    return {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastCompletionDate: completionDate,
      totalCompletions: newTotalCompletions,
    };
  }
}
