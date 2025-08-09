/**
 * Barrel file for exporting all storage modules.
 * This allows for cleaner imports elsewhere in the app.
 *
 * Example:
 * import { TaskStorage, AreaStorage } from '../storage';
 */

export * from './AsyncStorageService';
export * from './TaskStorage';
export * from './AreaStorage';
// Export future storage modules (e.g., StreakStorage, MoodStorage) here.
