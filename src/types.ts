export type TaskCategory = "Work" | "Study" | "Life" | "Finance" | "Health" | "Hackathon" | "Other";

export type ImportanceLevel = "Low" | "Medium" | "High" | "Critical";

export type RiskLevel = "Low" | "Medium" | "High";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  durationMinutes: number;
  sequenceOrder: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: TaskCategory;
  deadline: string; // ISO date string or YYYY-MM-DD
  estimatedEffortHours: number;
  importance: ImportanceLevel;
  priorityScore: number; // 0 - 100
  riskLevel: RiskLevel;
  riskExplanation: string;
  subtasks: Subtask[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  actionRecommendation: string;
  reminderSuggestion?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  dailyWorkloadLimitHours: number;
  avatarUrl?: string;
  joinedAt: string;
}

export interface DailyScheduleBlock {
  id: string;
  taskId: string;
  taskTitle: string;
  title: string; // E.g., "Build Auth UI" or "Review documentation"
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  durationMinutes: number;
  completed: boolean;
}

export interface DailySchedule {
  userId: string;
  date: string; // YYYY-MM-DD
  blocks: DailyScheduleBlock[];
  aiNotes: string;
}
