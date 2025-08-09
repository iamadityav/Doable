// Based on the data architecture from your blueprint

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export enum Period {
  Morning = 'morning',
  Evening = 'evening',
  Miscellaneous = 'miscellaneous', // Added new period
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
  notes?: string;
  areaId: string;
  projectId?: string;
  period: Period;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  scheduledDate?: Date;
  deadline?: Date;
  completedAt?: Date;
  tags: string[];
  subtasks: SubTask[];
  // repeatPattern?: RepeatPattern; // To be added later
}
