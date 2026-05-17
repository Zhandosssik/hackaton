export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  rating: number;
  totalXp: number;
  level: number;
  streak: number;
  practiceCompleted: number;
  educationCompleted: number;
  updatedAt: string;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserId: string | null;
  totalPlayers: number;
}

export interface SyncProgressBody {
  totalXp: number;
  streak: number;
  completedPractice: string[];
  educationCompleted: string[];
}
