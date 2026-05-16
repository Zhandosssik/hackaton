export type DailyTaskDifficulty = "easy" | "medium" | "hard";

export interface DailyTask {
  id: string;
  number: number;
  title: string;
  description: string;
  category: string;
  difficulty: DailyTaskDifficulty;
}

export interface DailyTasksPayload {
  date: string;
  tasks: DailyTask[];
  cached: boolean;
}

export interface DailyRequestContext {
  /** Локальная дата пользователя YYYY-MM-DD */
  date: string;
  learningGoal?: string;
  educationCompleted: number;
  practiceCompleted: number;
  playerLevel: number;
  totalXp: number;
  streak?: number;
}

export interface DailyProgress {
  date: string;
  completedTaskIds: string[];
  taskScores: Record<string, number>;
}
