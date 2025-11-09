/**
 * Shared types for Kana database
 */

export interface DbList {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  is_public: boolean;
  default_direction: 'front-to-back' | 'back-to-front' | null;
  is_example: boolean;
  is_test_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbCard {
  id: string;
  list_id: string;
  front: string;
  back: string;
  meaning: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  last_reviewed_at: string | null;
  view_count: number;
  flip_count: number;
  correct_count: number;
  incorrect_count: number;
  total_response_time_ms: number;
  fastest_response_ms: number | null;
  slowest_response_ms: number | null;
  mastery_level: number;
}

export interface DbProfile {
  id: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface ListWithCardCount extends DbList {
  cards: { count: number }[];
}

export interface ListUpdateFields {
  name?: string;
  description?: string | null;
  is_public?: boolean;
  is_example?: boolean;
  default_direction?: 'front-to-back' | 'back-to-front' | null;
}
