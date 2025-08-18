import { SubTask } from '../modals';
import uuid from 'react-native-uuid';

// --- AI Service for Task Breakdown ---
export class AIService {
  static async breakdownTask(taskTitle: string): Promise<SubTask[]> {
    const prompt = `...`; // Your prompt remains the same
    
    // IMPORTANT: Paste your actual API key here
    const apiKey = "AIzaSyDbUaMUDWjdY2AQvOx4nzPgLEevh9Lh_Og"; // This will be handled by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const requestBody = { /* ... */ };

    try {
      const response = await fetch(apiUrl, { /* ... */ });

      // Check for rate limit error
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      // ... (rest of the function remains the same)

    } catch (error: any) {
      // Pass the specific error message up
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        throw error; 
      }
      console.error("AI Service Error:", error);
      return [{ id: uuid.v4() as string, title: "Could not generate subtasks", completed: false }];
    }
  }
}