import { useState, useEffect } from 'react';
import uuid from 'react-native-uuid';
import { Area, Project } from '../modals';
import { AreaStorage } from '../services/storage';

// --- Initial Data ---
// This is used ONLY if no data is found in storage.
// It provides the default areas with empty project lists, as requested.
const initialAreas: Area[] = [
  {
    id: 'work',
    name: 'Work',
    icon: 'work',
    color: '#007AFF',
    projects: [],
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: 'personal',
    color: '#AF52DE',
    projects: [],
  },
  {
    id: 'health',
    name: 'Health',
    icon: 'health',
    color: '#34C759',
    projects: [],
  },
   {
    id: 'family',
    name: 'Family',
    icon: 'family',
    color: '#FF9500',
    projects: [],
  },
];


// --- Custom Hook ---
export const useAreas = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load areas from AsyncStorage on initial hook mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedAreas = await AreaStorage.getAreas();
        // The check `storedAreas.length > 0` is crucial. An empty array from storage
        // should be treated as "no data", allowing initialAreas to be set.
        if (storedAreas && storedAreas.length > 0) {
          setAreas(storedAreas);
        } else {
          // If storage is empty or cleared, set the initial default areas
          setAreas(initialAreas);
        }
      } catch (error) {
        console.error("Failed to load areas, falling back to initial data.", error);
        // Fallback to initial data in case of any storage errors
        setAreas(initialAreas);
      } finally {
        // Ensure isLoaded is always set to true to enable saving on subsequent changes.
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // Persist changes to storage whenever the areas state changes
  useEffect(() => {
    // We don't want to save during the initial load, only on user-initiated changes.
    if (isLoaded) {
      AreaStorage.saveAreas(areas);
    }
  }, [areas, isLoaded]);

  /**
   * Adds a new Area to the list.
   */
  const addArea = (data: { name: string; color: string; icon: string }) => {
    const newArea: Area = {
      ...data,
      id: uuid.v4() as string,
      projects: [],
    };
    setAreas(prev => [...prev, newArea]);
  };

  /**
   * Adds a new Project to a specific Area.
   */
  const addProjectToArea = (areaId: string, projectTitle: string) => {
    const newProject: Project = {
      id: uuid.v4() as string,
      title: projectTitle,
      areaId: areaId,
      tasks: [],
      completed: false,
      createdAt: new Date(),
    };

    const updatedAreas = areas.map(area => {
      if (area.id === areaId) {
        return {
          ...area,
          projects: [...area.projects, newProject],
        };
      }
      return area;
    });

    setAreas(updatedAreas);
  };

  return {
    areas,
    addArea,
    addProjectToArea,
  };
};
