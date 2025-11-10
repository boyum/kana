/**
 * Tests for performance tracking utilities
 */
import { describe, it, expect } from "vitest";
import {
  createEmptyPerformanceMetrics,
  recordCardView,
  calculateMasteryLevel,
  getCardDifficulty,
  getAverageResponseTime,
  getSuccessRate,
  formatTime,
} from "./performance";
import type { CardPerformanceMetrics } from "$lib/types/customLists";

describe("Performance tracking utilities", () => {
  describe("createEmptyPerformanceMetrics", () => {
    it("should create empty performance metrics object", () => {
      const metrics = createEmptyPerformanceMetrics();

      expect(metrics.viewCount).toBe(0);
      expect(metrics.flipCount).toBe(0);
      expect(metrics.correctCount).toBe(0);
      expect(metrics.incorrectCount).toBe(0);
      expect(metrics.totalResponseTimeMs).toBe(0);
      expect(metrics.masteryLevel).toBe(0);
    });
  });

  describe("recordCardView", () => {
    it("should record a fast correct answer (< 5s, no flips)", () => {
      const initial = createEmptyPerformanceMetrics();
      const result = recordCardView(initial, 3000, 0);

      expect(result.viewCount).toBe(1);
      expect(result.flipCount).toBe(0);
      expect(result.correctCount).toBe(1);
      expect(result.incorrectCount).toBe(0);
      expect(result.totalResponseTimeMs).toBe(3000);
      expect(result.fastestResponseMs).toBe(3000);
      expect(result.slowestResponseMs).toBe(3000);
      expect(result.lastReviewedAt).toBeInstanceOf(Date);
      expect(result.masteryLevel).toBeGreaterThan(0);
    });

    it("should record a slow incorrect answer (>= 5s)", () => {
      const initial = createEmptyPerformanceMetrics();
      const result = recordCardView(initial, 6000, 0);

      expect(result.viewCount).toBe(1);
      expect(result.correctCount).toBe(0);
      expect(result.incorrectCount).toBe(1);
      expect(result.totalResponseTimeMs).toBe(6000);
    });

    it("should record an answer with flips as incorrect", () => {
      const initial = createEmptyPerformanceMetrics();
      const result = recordCardView(initial, 2000, 2);

      expect(result.viewCount).toBe(1);
      expect(result.flipCount).toBe(2);
      expect(result.correctCount).toBe(0);
      expect(result.incorrectCount).toBe(1);
    });

    it("should update fastest response time", () => {
      let metrics = createEmptyPerformanceMetrics();
      metrics = recordCardView(metrics, 5000, 0);
      metrics = recordCardView(metrics, 3000, 0);
      metrics = recordCardView(metrics, 4000, 0);

      expect(metrics.fastestResponseMs).toBe(3000);
    });

    it("should update slowest response time", () => {
      let metrics = createEmptyPerformanceMetrics();
      metrics = recordCardView(metrics, 3000, 0);
      metrics = recordCardView(metrics, 7000, 1);
      metrics = recordCardView(metrics, 4000, 0);

      expect(metrics.slowestResponseMs).toBe(7000);
    });

    it("should accumulate view counts", () => {
      let metrics = createEmptyPerformanceMetrics();
      metrics = recordCardView(metrics, 3000, 0);
      metrics = recordCardView(metrics, 4000, 0);
      metrics = recordCardView(metrics, 2000, 0);

      expect(metrics.viewCount).toBe(3);
      expect(metrics.correctCount).toBe(3);
      expect(metrics.totalResponseTimeMs).toBe(9000);
    });

    it("should accumulate flip counts", () => {
      let metrics = createEmptyPerformanceMetrics();
      metrics = recordCardView(metrics, 5000, 1);
      metrics = recordCardView(metrics, 6000, 2);
      metrics = recordCardView(metrics, 7000, 1);

      expect(metrics.flipCount).toBe(4);
      expect(metrics.incorrectCount).toBe(3);
    });
  });

  describe("calculateMasteryLevel", () => {
    it("should return 0 for cards with no views", () => {
      const metrics = createEmptyPerformanceMetrics();
      const mastery = calculateMasteryLevel(metrics);

      expect(mastery).toBe(0);
    });

    it("should calculate high mastery for perfect performance", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 10,
        flipCount: 0,
        correctCount: 10,
        incorrectCount: 0,
        totalResponseTimeMs: 20000, // Avg 2s per card
        masteryLevel: 0,
        fastestResponseMs: 1500,
        slowestResponseMs: 2500,
      };

      const mastery = calculateMasteryLevel(metrics);

      expect(mastery).toBeGreaterThanOrEqual(90);
      expect(mastery).toBeLessThanOrEqual(100);
    });

    it("should calculate low mastery for poor performance", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 10,
        flipCount: 20,
        correctCount: 2,
        incorrectCount: 8,
        totalResponseTimeMs: 60000, // Avg 6s per card
        masteryLevel: 0,
        fastestResponseMs: 4000,
        slowestResponseMs: 8000,
      };

      const mastery = calculateMasteryLevel(metrics);

      expect(mastery).toBeLessThan(30);
    });

    it("should give speed bonus for fast average response time (< 3s)", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 5,
        flipCount: 0,
        correctCount: 5,
        incorrectCount: 0,
        totalResponseTimeMs: 10000, // Avg 2s
        masteryLevel: 0,
      };

      const mastery = calculateMasteryLevel(metrics);

      expect(mastery).toBeGreaterThanOrEqual(80);
    });

    it("should give partial speed bonus for moderately fast response (< 5s)", () => {
      const metricsWithPartialBonus: CardPerformanceMetrics = {
        viewCount: 5,
        flipCount: 0,
        correctCount: 5,
        incorrectCount: 0,
        totalResponseTimeMs: 20000, // Avg 4s
        masteryLevel: 0,
      };

      const metricsWithFullBonus: CardPerformanceMetrics = {
        ...metricsWithPartialBonus,
        totalResponseTimeMs: 10000, // Avg 2s
      };

      const partialMastery = calculateMasteryLevel(metricsWithPartialBonus);
      const fullMastery = calculateMasteryLevel(metricsWithFullBonus);

      expect(partialMastery).toBeLessThan(fullMastery);
      expect(partialMastery).toBeGreaterThanOrEqual(70);
    });

    it("should give consistency bonus for low time variation", () => {
      const consistentMetrics: CardPerformanceMetrics = {
        viewCount: 5,
        flipCount: 0,
        correctCount: 5,
        incorrectCount: 0,
        totalResponseTimeMs: 15000,
        masteryLevel: 0,
        fastestResponseMs: 2800,
        slowestResponseMs: 3200, // Small variation
      };

      const inconsistentMetrics: CardPerformanceMetrics = {
        ...consistentMetrics,
        fastestResponseMs: 1000,
        slowestResponseMs: 8000, // Large variation
      };

      const consistentMastery = calculateMasteryLevel(consistentMetrics);
      const inconsistentMastery = calculateMasteryLevel(inconsistentMetrics);

      expect(consistentMastery).toBeGreaterThan(inconsistentMastery);
    });

    it("should not give consistency bonus with fewer than 3 views", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 2,
        flipCount: 0,
        correctCount: 2,
        incorrectCount: 0,
        totalResponseTimeMs: 4000,
        masteryLevel: 0,
        fastestResponseMs: 1000,
        slowestResponseMs: 3000,
      };

      const mastery = calculateMasteryLevel(metrics);

      // Should only get base score + speed bonus, no consistency bonus
      expect(mastery).toBeLessThan(100);
    });

    it("should cap mastery level at 100", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 100,
        flipCount: 0,
        correctCount: 100,
        incorrectCount: 0,
        totalResponseTimeMs: 100000, // Avg 1s - very fast
        masteryLevel: 0,
        fastestResponseMs: 900,
        slowestResponseMs: 1100,
      };

      const mastery = calculateMasteryLevel(metrics);

      // With perfect success, fast speed, and consistency, should be near or at 100
      expect(mastery).toBeGreaterThanOrEqual(99);
      expect(mastery).toBeLessThanOrEqual(100);
    });
  });

  describe("getCardDifficulty", () => {
    it("should return 'new' for cards with no views", () => {
      const metrics = createEmptyPerformanceMetrics();
      const difficulty = getCardDifficulty(metrics);

      expect(difficulty).toBe("new");
    });

    it("should return 'easy' for high success rate and low flip ratio", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 10,
        flipCount: 2, // Flip ratio: 0.2
        correctCount: 9, // Success rate: 0.9
        incorrectCount: 1,
        totalResponseTimeMs: 30000,
        masteryLevel: 90,
      };

      const difficulty = getCardDifficulty(metrics);

      expect(difficulty).toBe("easy");
    });

    it("should return 'medium' for moderate success rate", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 10,
        flipCount: 7, // Flip ratio: 0.7
        correctCount: 6, // Success rate: 0.6
        incorrectCount: 4,
        totalResponseTimeMs: 50000,
        masteryLevel: 50,
      };

      const difficulty = getCardDifficulty(metrics);

      expect(difficulty).toBe("medium");
    });

    it("should return 'hard' for low success rate", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 10,
        flipCount: 8,
        correctCount: 2, // Success rate: 0.2
        incorrectCount: 8,
        totalResponseTimeMs: 70000,
        masteryLevel: 20,
      };

      const difficulty = getCardDifficulty(metrics);

      expect(difficulty).toBe("hard");
    });

    it("should return 'hard' for high flip ratio", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 10,
        flipCount: 20, // Flip ratio: 2.0
        correctCount: 5,
        incorrectCount: 5,
        totalResponseTimeMs: 60000,
        masteryLevel: 40,
      };

      const difficulty = getCardDifficulty(metrics);

      expect(difficulty).toBe("hard");
    });

    it("should return 'easy' at success rate boundary (0.7)", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 10,
        flipCount: 3,
        correctCount: 7, // Success rate: exactly 0.7
        incorrectCount: 3,
        totalResponseTimeMs: 40000,
        masteryLevel: 60,
      };

      const difficulty = getCardDifficulty(metrics);

      // 0.7 success rate is NOT < 0.7, so it should be easy
      expect(difficulty).toBe("easy");
    });
  });

  describe("getAverageResponseTime", () => {
    it("should return 0 for cards with no views", () => {
      const metrics = createEmptyPerformanceMetrics();
      const avgTime = getAverageResponseTime(metrics);

      expect(avgTime).toBe(0);
    });

    it("should calculate average response time", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 4,
        flipCount: 0,
        correctCount: 4,
        incorrectCount: 0,
        totalResponseTimeMs: 12000, // 3000ms average
        masteryLevel: 80,
      };

      const avgTime = getAverageResponseTime(metrics);

      expect(avgTime).toBe(3000);
    });

    it("should round average response time", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 3,
        flipCount: 0,
        correctCount: 3,
        incorrectCount: 0,
        totalResponseTimeMs: 10000, // 3333.33ms average
        masteryLevel: 80,
      };

      const avgTime = getAverageResponseTime(metrics);

      expect(avgTime).toBe(3333);
    });
  });

  describe("getSuccessRate", () => {
    it("should return 0 for cards with no views", () => {
      const metrics = createEmptyPerformanceMetrics();
      const successRate = getSuccessRate(metrics);

      expect(successRate).toBe(0);
    });

    it("should calculate success rate as percentage", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 10,
        flipCount: 5,
        correctCount: 7,
        incorrectCount: 3,
        totalResponseTimeMs: 40000,
        masteryLevel: 70,
      };

      const successRate = getSuccessRate(metrics);

      expect(successRate).toBe(70);
    });

    it("should return 100 for perfect performance", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 5,
        flipCount: 0,
        correctCount: 5,
        incorrectCount: 0,
        totalResponseTimeMs: 15000,
        masteryLevel: 100,
      };

      const successRate = getSuccessRate(metrics);

      expect(successRate).toBe(100);
    });

    it("should round success rate", () => {
      const metrics: CardPerformanceMetrics = {
        viewCount: 3,
        flipCount: 1,
        correctCount: 2, // 66.66%
        incorrectCount: 1,
        totalResponseTimeMs: 12000,
        masteryLevel: 60,
      };

      const successRate = getSuccessRate(metrics);

      expect(successRate).toBe(67);
    });
  });

  describe("formatTime", () => {
    it("should format milliseconds for values < 1000", () => {
      expect(formatTime(0)).toBe("0ms");
      expect(formatTime(150)).toBe("150ms");
      expect(formatTime(999)).toBe("999ms");
    });

    it("should format seconds for values >= 1000", () => {
      expect(formatTime(1000)).toBe("1.0s");
      expect(formatTime(2500)).toBe("2.5s");
      expect(formatTime(5750)).toBe("5.8s");
    });

    it("should handle large values", () => {
      expect(formatTime(10000)).toBe("10.0s");
      expect(formatTime(60000)).toBe("60.0s");
    });
  });
});
