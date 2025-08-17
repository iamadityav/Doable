import { useState, useEffect } from 'react';
import uuid from 'react-native-uuid';
import { Task, Period, Priority } from '../modals';
import { TaskStorage } from '../services/storage';
import { useStreak } from './useStreak';

const initialTasks: Task[] = [
    {
        id: 'default-m1',
        title: 'First Task',
        areaId: 'Personal',
        period: Period.Morning,
        priority: Priority.Medium,
        completed: false,
        createdAt: new Date(),
        tags: [],
        subtasks: [],
    },
    {
        id: 'default-e1',
        title: 'First Task',
        areaId: 'Personal',
        period: Period.Evening,
        priority: Priority.Medium,
        completed: false,
        createdAt: new Date(),
        tags: [],
        subtasks: [],
    },
    {
        id: 'default-misc1',
        title: 'First Task',
        areaId: 'Personal',
        period: Period.Miscellaneous,
        priority: Priority.Medium,
        completed: false,
        createdAt: new Date(),
        tags: [],
        subtasks: [],
    },
];

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { handleTaskCompletion } = useStreak();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        let finalTasks: Task[] = [];
        const storedTasks = await TaskStorage.getTasks();
        
        if (storedTasks && storedTasks.length > 0) {
          finalTasks = [...storedTasks];
          initialTasks.forEach(initialTask => {
            if (!finalTasks.some(storedTask => storedTask.id === initialTask.id)) {
              finalTasks.push(initialTask);
            }
          });
        } else {
          finalTasks = initialTasks;
        }
        setTasks(finalTasks);
      } catch (error) {
        console.error("Failed to load tasks, falling back to initial data.", error);
        setTasks(initialTasks);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      TaskStorage.saveTasks(tasks);
    }
  }, [tasks, isLoaded]);

  const addTask = (newTaskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'subtasks' | 'tags'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: uuid.v4() as string,
      completed: false,
      createdAt: new Date(),
      subtasks: [],
      tags: [],
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const toggleTask = (taskId: string) => {
    let wasCompleted = false;
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        wasCompleted = !task.completed;
        return { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : undefined };
      }
      return task;
    });
    setTasks(updatedTasks);
    if (wasCompleted) {
      handleTaskCompletion();
    }
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
};
