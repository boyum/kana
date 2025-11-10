export interface DailyStat {
  id: string;
  user_id: string;
  list_id: string | null;
  date: string;
  sessions_count: number;
  total_duration_ms: number;
  cards_reviewed: number;
  correct_answers: number;
  incorrect_answers: number;
  accuracy_percentage: number;
  average_response_time_ms: number;
  average_mastery_level?: number;
  cards_mastered?: number;
  created_at: string;
  updated_at: string;
}

export interface ProgressSummary {
  totalSessions: number;
  totalCardsReviewed: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalDurationMs: number;
  averageAccuracy: number;
  averageResponseTime: number;
  currentStreak: number;
}

export interface MasteryDistribution {
  new: number;
  learning: number;
  familiar: number;
  mastered: number;
}

export interface ProgressStats {
  dailyStats: DailyStat[];
  summary: ProgressSummary;
  masteryDistribution: MasteryDistribution;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  list_id: string;
  started_at: string;
  ended_at?: string;
  duration_ms?: number;
  total_cards: number;
  cards_reviewed: number;
  correct_answers: number;
  incorrect_answers: number;
  skipped_cards: number;
  average_response_time_ms?: number;
  session_type: 'practice' | 'test' | 'review';
  direction: 'front-to-back' | 'back-to-front';
  completed: boolean;
  created_at: string;
  lists?: {
    id: string;
    name: string;
  };
}

export interface SessionCardAttempt {
  id: string;
  session_id: string;
  card_id: string;
  attempted_at: string;
  response_time_ms?: number;
  was_correct?: boolean;
  was_skipped: boolean;
  difficulty_rating?: number;
  notes?: string;
  created_at: string;
  cards?: {
    id: string;
    front: string;
    back: string;
    meaning?: string;
  };
}
