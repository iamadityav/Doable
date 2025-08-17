export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export enum Period {
  Morning = 'morning',
  Evening = 'evening',
  Miscellaneous = 'miscellaneous',
  Anytime = 'anytime',
}

export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export interface Task {
  id: string;
  title: string;
  notes?: string; // New field for additional info/notes
  areaId: string;
  projectId?: string;
  period: Period;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  scheduledDate?: Date;
  scheduledTime?: string;
  deadline?: Date;
  completedAt?: Date;
  tags: string[];
  subtasks: SubTask[];
}
