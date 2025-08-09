import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A generic service for interacting with AsyncStorage.
 * Handles JSON serialization and parsing automatically.
 */
export class AsyncStorageService {
  /**
   * Retrieves an item from AsyncStorage and parses it as JSON.
   * @param key The key of the item to retrieve.
   * @returns The parsed item, or null if not found or on error.
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
    } catch (e) {
      console.error(`Failed to get item for key: ${key}`, e);
      return null;
    }
  }

  /**
   * Saves an item to AsyncStorage after converting it to a JSON string.
   * @param key The key to store the item under.
   * @param value The value to store.
   */
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error(`Failed to set item for key: ${key}`, e);
    }
  }

  /**
   * Removes an item from AsyncStorage.
   * @param key The key of the item to remove.
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Failed to remove item for key: ${key}`, e);
    }
  }
}
