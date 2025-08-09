import { AsyncStorageService } from './AsyncStorageService';
import { Area } from '../../hooks/useArea'; // Assuming Area interface is exported from useAreas hook

const AREAS_STORAGE_KEY = '@RoutineBuddy:areas';

/**
 * Manages all storage operations related to Areas and their Projects.
 */
export class AreaStorage {
  /**
   * Retrieves all areas from storage.
   * @returns An array of areas, or an empty array if none are found.
   */
  static async getAreas(): Promise<Area[]> {
    const areas = await AsyncStorageService.getItem<Area[]>(AREAS_STORAGE_KEY);
     // Note: Re-hydrate any Date objects within projects if necessary
    if (areas) {
        return areas.map(area => ({
            ...area,
            projects: area.projects.map(project => ({
                ...project,
                createdAt: new Date(project.createdAt),
                deadline: project.deadline ? new Date(project.deadline) : undefined,
            }))
        }))
    }
    return [];
  }

  /**
   * Saves the entire array of areas to storage.
   * @param areas The array of areas to save.
   */
  static async saveAreas(areas: Area[]): Promise<void> {
    await AsyncStorageService.setItem(AREAS_STORAGE_KEY, areas);
  }

  // Future methods like addArea, updateArea, addProjectToArea, etc. would go here.
}
