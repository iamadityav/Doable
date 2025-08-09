import { AsyncStorageService } from './AsyncStorageService';
import { Task } from '../hooks/useTasks'; // Assuming Task interface is exported from useTasks hook

const TASKS_STORAGE_KEY = '@RoutineBuddy:tasks';

/**
 * Manages all storage operations related to Tasks.
 */
export class TaskStorage {
  /**
   * Retrieves all tasks from storage.
   * @returns An array of tasks, or an empty array if none are found.
   */
  static async getTasks(): Promise<Task[]> {
    const tasks = await AsyncStorageService.getItem<Task[]>(TASKS_STORAGE_KEY);
    // Note: JSON stringify/parse does not preserve Date objects. They need to be re-hydrated.
    if (tasks) {
      return tasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : undefined,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }));
    }
    return [];
  }

  /**
   * Saves the entire array of tasks to storage.
   * @param tasks The array of tasks to save.
   */
  static async saveTasks(tasks: Task[]): Promise<void> {
    await AsyncStorageService.setItem(TASKS_STORAGE_KEY, tasks);
  }

  /**
   * Adds a single new task to the existing list.
   * @param newTask The new task to add.
   */
  static async addTask(newTask: Task): Promise<void> {
    const existingTasks = await this.getTasks();
    const updatedTasks = [...existingTasks, newTask];
    await this.saveTasks(updatedTasks);
  }

  /**
   * Updates a single task in the list.
   * @param updatedTask The task with updated properties.
   */
  static async updateTask(updatedTask: Task): Promise<void> {
    const existingTasks = await this.getTasks();
    const updatedTasks = existingTasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    await this.saveTasks(updatedTasks);
  }

  /**
   * Deletes a task by its ID.
   * @param taskId The ID of the task to delete.
   */
  static async deleteTask(taskId: string): Promise<void> {
    const existingTasks = await this.getTasks();
    const updatedTasks = existingTasks.filter(task => task.id !== taskId);
    await this.saveTasks(updatedTasks);
  }
}
