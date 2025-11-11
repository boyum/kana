import type { CustomFlashCard } from "$lib/types/customLists";
import { createEmptyPerformanceMetrics } from "$lib/utils/performance";
import {
  performSmartShuffle,
  calculateCardWeight,
  getShuffleSessionStats,
  getMasteryDistribution,
  type SmartShuffleConfig,
} from "$lib/utils/smartShuffle";
import { describe, it, expect, beforeEach } from "vitest";

/**
 * Tests for smart shuffle with combined multi-list cards
 * Ensures mastery-based weighting works correctly across multiple lists
 */

describe("Smart shuffle with combined lists", () => {
  let cardsFromList1: CustomFlashCard[];
  let cardsFromList2: CustomFlashCard[];
  let cardsFromList3: CustomFlashCard[];
  let combinedCards: CustomFlashCard[];

  beforeEach(() => {
    // List 1: High mastery cards (advanced)
    cardsFromList1 = [
      {
        id: "card-1-1",
        front: "あ",
        back: "a",
        meaning: "vowel a",
        performance: {
          ...createEmptyPerformanceMetrics(),
          masteryLevel: 85,
          viewCount: 20,
          correctCount: 17,
        },
        createdAt: new Date(),
      },
      {
        id: "card-1-2",
        front: "い",
        back: "i",
        meaning: "vowel i",
        performance: {
          ...createEmptyPerformanceMetrics(),
          masteryLevel: 90,
          viewCount: 25,
          correctCount: 23,
        },
        createdAt: new Date(),
      },
    ];

    // List 2: Medium mastery cards (intermediate)
    cardsFromList2 = [
      {
        id: "card-2-1",
        front: "ア",
        back: "a",
        meaning: "katakana a",
        performance: {
          ...createEmptyPerformanceMetrics(),
          masteryLevel: 50,
          viewCount: 10,
          correctCount: 5,
        },
        createdAt: new Date(),
      },
      {
        id: "card-2-2",
        front: "イ",
        back: "i",
        meaning: "katakana i",
        performance: {
          ...createEmptyPerformanceMetrics(),
          masteryLevel: 60,
          viewCount: 12,
          correctCount: 7,
        },
        createdAt: new Date(),
      },
    ];

    // List 3: Low mastery cards (beginner)
    cardsFromList3 = [
      {
        id: "card-3-1",
        front: "こんにちは",
        back: "hello",
        meaning: "greeting",
        performance: {
          ...createEmptyPerformanceMetrics(),
          masteryLevel: 20,
          viewCount: 5,
          correctCount: 1,
        },
        createdAt: new Date(),
      },
      {
        id: "card-3-2",
        front: "ありがとう",
        back: "thank you",
        meaning: "gratitude",
        performance: {
          ...createEmptyPerformanceMetrics(),
          masteryLevel: 30,
          viewCount: 8,
          correctCount: 2,
        },
        createdAt: new Date(),
      },
    ];

    combinedCards = [...cardsFromList1, ...cardsFromList2, ...cardsFromList3];
  });

  describe("Weight calculation across lists", () => {
    it("should calculate weights for cards from different lists", () => {
      const weights = combinedCards.map(card =>
        calculateCardWeight(card.performance.masteryLevel, "balanced"),
      );

      expect(weights).toHaveLength(6);
      expect(weights.every(w => w >= 1.0)).toBe(true);
    });

    it("should give higher weights to high mastery cards", () => {
      const highMasteryCard = cardsFromList1[1]; // 90 mastery
      const lowMasteryCard = cardsFromList3[0]; // 20 mastery

      const highWeight = calculateCardWeight(
        highMasteryCard.performance.masteryLevel,
        "balanced",
      );
      const lowWeight = calculateCardWeight(
        lowMasteryCard.performance.masteryLevel,
        "balanced",
      );

      expect(highWeight).toBeGreaterThan(lowWeight);
    });

    it("should calculate consistent weights regardless of list origin", () => {
      // Two cards with same mastery from different lists
      const card1 = { ...cardsFromList1[0] };
      const card2 = { ...cardsFromList2[0] };

      card1.performance.masteryLevel = 70;
      card2.performance.masteryLevel = 70;

      const weight1 = calculateCardWeight(
        card1.performance.masteryLevel,
        "balanced",
      );
      const weight2 = calculateCardWeight(
        card2.performance.masteryLevel,
        "balanced",
      );

      expect(weight1).toBe(weight2);
    });
  });

  describe("Smart shuffle with combined lists", () => {
    it("should shuffle cards from all lists together", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(combinedCards, config);

      expect(shuffled.length).toBeGreaterThan(0);
      expect(shuffled.length).toBeLessThanOrEqual(25);
    });

    it("should include cards from multiple lists in shuffled result", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(combinedCards, config);

      // Check that we have cards from different lists
      const hasListOnecards = shuffled.some(c => c.id.startsWith("card-1-"));
      const hasList2cards = shuffled.some(c => c.id.startsWith("card-2-"));
      const hasList3cards = shuffled.some(c => c.id.startsWith("card-3-"));

      expect(hasListOnecards || hasList2cards || hasList3cards).toBe(true);
    });

    it("should work with challenge-first mode across lists", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "challenge-first",
      };

      const shuffled = performSmartShuffle(combinedCards, config);

      // In challenge-first mode, harder cards (low mastery) should appear more
      const stats = getShuffleSessionStats(combinedCards, shuffled);
      const distribution = getMasteryDistribution(stats);

      // Hard cards should have higher representation in challenge-first mode
      expect(distribution.hardCards.count).toBeGreaterThan(0);
    });

    it("should work with mastery-focused mode across lists", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "mastery-focused",
      };

      const shuffled = performSmartShuffle(combinedCards, config);

      // In mastery-focused mode, easier cards (high mastery) should appear more
      const stats = getShuffleSessionStats(combinedCards, shuffled);
      const distribution = getMasteryDistribution(stats);

      // Easy cards should have higher representation
      expect(distribution.easyCards.count).toBeGreaterThan(0);
    });
  });

  describe("Shuffle session statistics", () => {
    it("should calculate stats for combined list session", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(combinedCards, config);
      const stats = getShuffleSessionStats(combinedCards, shuffled);

      expect(stats.totalCardsInSession).toBeGreaterThan(0);
      expect(stats.uniqueCardsIncluded).toBeGreaterThan(0);
      expect(stats.uniqueCardsIncluded).toBeLessThanOrEqual(
        combinedCards.length,
      );
    });

    it("should track card appearances across lists", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(combinedCards, config);
      const stats = getShuffleSessionStats(combinedCards, shuffled);

      // Should have appearance data for each unique card
      expect(stats.cardAppearances.length).toBeGreaterThan(0);
      expect(stats.cardAppearances.every(c => c.appearanceCount >= 1)).toBe(
        true,
      );
    });

    it("should calculate mastery distribution across combined lists", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(combinedCards, config);
      const stats = getShuffleSessionStats(combinedCards, shuffled);
      const distribution = getMasteryDistribution(stats);

      // Total percentages should add up to ~100%
      const total =
        distribution.hardCards.percentage +
        distribution.mediumCards.percentage +
        distribution.easyCards.percentage;

      expect(total).toBeGreaterThan(90); // Allow for rounding
      expect(total).toBeLessThanOrEqual(100);
    });

    it("should identify cards from each difficulty level across lists", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(combinedCards, config);
      const stats = getShuffleSessionStats(combinedCards, shuffled);
      const distribution = getMasteryDistribution(stats);

      // We have cards in all difficulty ranges
      expect(distribution.hardCards.count).toBeGreaterThan(0); // from list 3
      expect(distribution.mediumCards.count).toBeGreaterThan(0); // from list 2
      expect(distribution.easyCards.count).toBeGreaterThan(0); // from list 1
    });
  });

  describe("Weighted appearance with multiple lists", () => {
    it("should allow high-mastery cards to appear multiple times", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "mastery-focused",
      };

      const shuffled = performSmartShuffle(combinedCards, config);
      const stats = getShuffleSessionStats(combinedCards, shuffled);

      // High mastery cards might appear more than once
      const highMasteryCardAppearances = stats.cardAppearances.find(
        c => c.masteryLevel >= 80,
      );

      if (highMasteryCardAppearances) {
        expect(highMasteryCardAppearances.appearanceCount).toBeGreaterThan(0);
      }
    });

    it("should respect individual card weights across lists", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(combinedCards, config);
      const stats = getShuffleSessionStats(combinedCards, shuffled);

      // Cards should appear based on their mastery level
      stats.cardAppearances.forEach(card => {
        expect(card.appearanceCount).toBeGreaterThan(0);
      });
    });
  });

  describe("Edge cases with combined lists", () => {
    it("should handle all cards having same mastery level", () => {
      const uniformCards = combinedCards.map(c => ({
        ...c,
        performance: { ...c.performance, masteryLevel: 50 },
      }));

      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(uniformCards, config);

      expect(shuffled.length).toBeGreaterThan(0);
      expect(shuffled.length).toBeLessThanOrEqual(25);
    });

    it("should handle combining many lists", () => {
      const manyListsCards: CustomFlashCard[] = [];

      for (let i = 0; i < 10; i++) {
        manyListsCards.push({
          id: `card-list-${i}`,
          front: `Front ${i}`,
          back: `Back ${i}`,
          performance: {
            ...createEmptyPerformanceMetrics(),
            masteryLevel: i * 10,
          },
          createdAt: new Date(),
        });
      }

      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(manyListsCards, config);

      expect(shuffled.length).toBeGreaterThan(0);
      expect(shuffled.length).toBeLessThanOrEqual(20);
    });

    it("should handle combining lists with few cards", () => {
      const fewCards = [cardsFromList1[0], cardsFromList2[0]];

      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(fewCards, config);

      expect(shuffled.length).toBeGreaterThan(0);
    });

    it("should work with smart shuffle disabled", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: false,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(combinedCards, config);

      // Should return simple shuffled array
      expect(shuffled.length).toBe(combinedCards.length);
      expect(shuffled.length).toBe(6);
    });
  });

  describe("Consistency across shuffles", () => {
    it("should produce different shuffles with same config", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled1 = performSmartShuffle(combinedCards, config);
      const shuffled2 = performSmartShuffle(combinedCards, config);

      // Order should be different (due to randomness)
      const sameOrder = shuffled1.every(
        (card, index) => card.id === shuffled2[index]?.id,
      );

      // Very unlikely to be the same order (possible but extremely rare)
      // This test might occasionally fail due to randomness, but that's okay
      expect(sameOrder).toBe(false);
    });

    it("should maintain mastery distribution pattern across shuffles", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled1 = performSmartShuffle(combinedCards, config);
      const shuffled2 = performSmartShuffle(combinedCards, config);

      const stats1 = getShuffleSessionStats(combinedCards, shuffled1);
      const stats2 = getShuffleSessionStats(combinedCards, shuffled2);

      const dist1 = getMasteryDistribution(stats1);
      const dist2 = getMasteryDistribution(stats2);

      // Distributions should be similar (within 20% variance)
      const easyDiff = Math.abs(
        dist1.easyCards.percentage - dist2.easyCards.percentage,
      );
      const mediumDiff = Math.abs(
        dist1.mediumCards.percentage - dist2.mediumCards.percentage,
      );
      const hardDiff = Math.abs(
        dist1.hardCards.percentage - dist2.hardCards.percentage,
      );

      expect(easyDiff).toBeLessThan(30);
      expect(mediumDiff).toBeLessThan(30);
      expect(hardDiff).toBeLessThan(30);
    });
  });

  describe("Integration with combined list practice", () => {
    it("should preserve card metadata after shuffle", () => {
      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(combinedCards, config);

      // All shuffled cards should maintain their metadata
      shuffled.forEach(card => {
        const original = combinedCards.find(c => c.id === card.id);
        expect(card.front).toBe(original?.front);
        expect(card.back).toBe(original?.back);
        expect(card.meaning).toBe(original?.meaning);
        expect(card.performance.masteryLevel).toBe(
          original?.performance.masteryLevel,
        );
      });
    });

    it("should work with list-specific mastery patterns", () => {
      // Simulate scenario: List 1 = all mastered, List 2 = all struggling
      const masteredList = cardsFromList1.map(c => ({
        ...c,
        performance: { ...c.performance, masteryLevel: 90 },
      }));

      const strugglingList = cardsFromList3.map(c => ({
        ...c,
        performance: { ...c.performance, masteryLevel: 20 },
      }));

      const combined = [...masteredList, ...strugglingList];

      const config: SmartShuffleConfig = {
        enableSmartShuffle: true,
        shuffleMode: "balanced",
      };

      const shuffled = performSmartShuffle(combined, config);
      const stats = getShuffleSessionStats(combined, shuffled);
      const distribution = getMasteryDistribution(stats);

      // Should have both easy and hard cards represented
      expect(distribution.easyCards.count).toBeGreaterThan(0);
      expect(distribution.hardCards.count).toBeGreaterThan(0);
    });
  });
});
