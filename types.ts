export enum EducationLevel {
  PRIMARY = 'ابتدائي',
  MIDDLE = 'متوسط',
  HIGH = 'ثانوي'
}

export interface UserProfile {
  name: string;
  age: number;
  level: EducationLevel;
  languages: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  type: 'quran_morning' | 'language' | 'quran_evening' | 'fun';
}

export interface DayPlan {
  dayNumber: number;
  tasks: Task[];
}

export interface AppData {
  profile: UserProfile | null;
  plan: DayPlan[];
  startDate: string; // ISO string
  generatedImages?: string[]; // Array of base64 image strings
}