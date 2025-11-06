// Type definitions for custom lists functionality

/**
 * Performance metrics for individual cards
 * Used to calculate difficulty, mastery level, and determine review priority
 */
export interface CardPerformanceMetrics {
  viewCount: number; // Total times this card has been viewed
  flipCount: number; // Total times user flipped to see the back
  correctCount: number; // Number of times answered "correctly" (quickly without flips)
  incorrectCount: number; // Number of times user struggled (slow or multiple flips)
  totalResponseTimeMs: number; // Sum of all response times in milliseconds
  fastestResponseMs?: number; // Fastest time to respond
  slowestResponseMs?: number; // Slowest time to respond
  lastReviewedAt?: Date; // Timestamp of last practice
  masteryLevel: number; // 0-100 score based on performance
}

export interface CustomFlashCard {
  id: string; // Unique identifier
  front: string; // Front side content
  back: string; // Back side content
  meaning?: string; // Optional meaning/translation
  notes?: string; // Optional study notes
  tags?: string[]; // Optional tags for filtering
  createdAt: Date;
  lastReviewed?: Date;
  performance: CardPerformanceMetrics; // Performance tracking data
}

export interface CustomList {
  id: string; // Unique identifier
  name: string; // User-defined list name
  cards: CustomFlashCard[];
  createdAt: Date;
  updatedAt: Date;
  defaultDirection?: "front-to-back" | "back-to-front"; // Default practice direction
}

// For serialization/deserialization
export interface SerializedCardPerformanceMetrics {
  viewCount: number;
  flipCount: number;
  correctCount: number;
  incorrectCount: number;
  totalResponseTimeMs: number;
  fastestResponseMs?: number;
  slowestResponseMs?: number;
  lastReviewedAt?: string;
  masteryLevel: number;
}

export interface SerializedCustomFlashCard {
  id: string;
  front: string;
  back: string;
  meaning?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  lastReviewed?: string;
  performance: SerializedCardPerformanceMetrics;
}

export interface SerializedCustomList {
  id: string;
  name: string;
  cards: SerializedCustomFlashCard[];
  createdAt: string;
  updatedAt: string;
  defaultDirection?: "front-to-back" | "back-to-front";
}
