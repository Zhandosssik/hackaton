export interface PracticeHistoryEntry {
  lessonId: string;
  score: number;
  xpEarned: number;
  date: string;
}

export interface GameProgress {
  totalXp: number;
  hearts: number;
  streak: number;
  lastActiveDate: string | null;
  completedPractice: string[];
  practiceHistory: PracticeHistoryEntry[];
}

export type AchievementIconId =
  | "book-open"
  | "graduation"
  | "target"
  | "zap"
  | "flame"
  | "dumbbell"
  | "star"
  | "gem";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: AchievementIconId;
  unlocked: boolean;
}
