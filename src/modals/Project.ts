export interface Project {
  id: string;
  title: string;
  description?: string;
  areaId: string;
  deadline?: Date;
  tasks: string[]; // Array of Task IDs
  completed: boolean;
  createdAt: Date;
}