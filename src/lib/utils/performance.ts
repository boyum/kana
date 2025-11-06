/**
 * Performance tracking utilities for gamification Phase 1
 * Handles response time tracking, flip counting, and mastery level calculation
 */
import type { CardPerformanceMetrics } from "$lib/types/customLists";

/**
 * Creates an empty performance metrics object for new cards
 */
export function createEmptyPerformanceMetrics(): CardPerformanceMetrics {
  return {
    viewCount: 0,
    flipCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    totalResponseTimeMs: 0,
    masteryLevel: 0,
  };
}

/**
 * Records a card view with timing and flip information
 *
 * @param metrics Current performance metrics
 * @param responseTimeMs Time from showing card to flipping it (first interaction)
 * @param flipCount Number of flips during this view
 * @returns Updated performance metrics
 */
export function recordCardView(
  metrics: CardPerformanceMetrics,
  responseTimeMs: number,
  flipCount: number,
): CardPerformanceMetrics {
  const updated = { ...metrics };

  // Update view count
  updated.viewCount += 1;

  // Update flip count
  updated.flipCount += flipCount;

  // Update response time stats
  updated.totalResponseTimeMs += responseTimeMs;

  if (
    updated.fastestResponseMs === undefined ||
    responseTimeMs < updated.fastestResponseMs
  ) {
    updated.fastestResponseMs = responseTimeMs;
  }

  if (
    updated.slowestResponseMs === undefined ||
    responseTimeMs > updated.slowestResponseMs
  ) {
    updated.slowestResponseMs = responseTimeMs;
  }

  // Determine if this was a "correct" or "incorrect" attempt
  // Correct = answered quickly (< 5 seconds) without flipping
  // Incorrect = slow answer or multiple flips
  const isCorrect = responseTimeMs < 5000 && flipCount === 0;

  if (isCorrect) {
    updated.correctCount += 1;
  } else {
    updated.incorrectCount += 1;
  }

  // Update last reviewed timestamp
  updated.lastReviewedAt = new Date();

  // Recalculate mastery level
  updated.masteryLevel = calculateMasteryLevel(updated);

  return updated;
}

/**
 * Calculate mastery level (0-100) based on performance metrics
 * Formula considers:
 * - View count (familiarity with card)
 * - Flip count (difficulty level)
 * - Correct vs incorrect ratio (success rate)
 * - Response time (speed)
 *
 * @param metrics Performance metrics to evaluate
 * @returns Mastery level from 0-100
 */
export function calculateMasteryLevel(metrics: CardPerformanceMetrics): number {
  if (metrics.viewCount === 0) {
    return 0;
  }

  // Base score from correct/incorrect ratio
  const successRate = metrics.correctCount / metrics.viewCount;
  let score = successRate * 60; // Success rate worth up to 60 points

  // Bonus for consistency (low variation in response times)
  if (
    metrics.viewCount >= 3 &&
    metrics.fastestResponseMs &&
    metrics.slowestResponseMs
  ) {
    const timeVariation = metrics.slowestResponseMs - metrics.fastestResponseMs;
    const avgTime = metrics.totalResponseTimeMs / metrics.viewCount;
    const consistency = Math.max(0, 1 - timeVariation / (avgTime * 5));
    score += consistency * 20; // Consistency worth up to 20 points
  }

  // Bonus for speed (if average response time is fast)
  const avgResponseTime = metrics.totalResponseTimeMs / metrics.viewCount;
  if (avgResponseTime < 3000) {
    score += 20; // Full speed bonus if avg < 3 seconds
  } else if (avgResponseTime < 5000) {
    score += 10; // Partial speed bonus if avg < 5 seconds
  }

  return Math.min(100, Math.round(score));
}

/**
 * Get difficulty level for a card based on performance
 * Difficulty affects learning priority and study recommendations
 *
 * @param metrics Performance metrics
 * @returns Difficulty level: 'easy', 'medium', 'hard'
 */
export function getCardDifficulty(
  metrics: CardPerformanceMetrics,
): "new" | "easy" | "medium" | "hard" {
  // New cards haven't been viewed yet
  if (metrics.viewCount === 0) {
    return "new";
  }

  // Cards with high flip count relative to views are hard
  const flipRatio = metrics.flipCount / metrics.viewCount;

  // Cards with low success rate are hard
  const successRate = metrics.correctCount / metrics.viewCount;

  if (successRate < 0.3 || flipRatio > 1.5) {
    return "hard";
  }

  if (successRate < 0.7 || flipRatio > 0.5) {
    return "medium";
  }

  return "easy";
}

/**
 * Get average response time in milliseconds
 *
 * @param metrics Performance metrics
 * @returns Average response time, or 0 if no views
 */
export function getAverageResponseTime(
  metrics: CardPerformanceMetrics,
): number {
  if (metrics.viewCount === 0) return 0;
  return Math.round(metrics.totalResponseTimeMs / metrics.viewCount);
}

/**
 * Get success rate as percentage (0-100)
 *
 * @param metrics Performance metrics
 * @returns Success rate percentage
 */
export function getSuccessRate(metrics: CardPerformanceMetrics): number {
  if (metrics.viewCount === 0) return 0;
  return Math.round((metrics.correctCount / metrics.viewCount) * 100);
}

/**
 * Format milliseconds to human-readable time
 *
 * @param ms Milliseconds
 * @returns Formatted time string (e.g., "2.5s", "150ms")
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}
