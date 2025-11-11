/**
 * Smart Shuffle Utility for Phase 2 Gamification
 * Implements weighted shuffling based on card mastery levels
 * Cards with higher mastery appear more frequently in shuffled sessions
 */
import type { CustomFlashCard } from "$lib/types/customLists";

/**
 * Shuffle mode determining how weights are calculated
 */
export type ShuffleMode = "balanced" | "mastery-focused" | "challenge-first";

/**
 * Configuration for smart shuffle behavior
 */
export interface SmartShuffleConfig {
  enableSmartShuffle: boolean;
  shuffleMode: ShuffleMode;
}

/**
 * Represents a card with its appearance count in a shuffle
 */
export interface ShuffledCard {
  card: CustomFlashCard;
  originalIndex: number;
  appearanceCount: number; // How many times this card appears in the session
}

/**
 * Default smart shuffle configuration
 */
export const DEFAULT_SMART_SHUFFLE_CONFIG: SmartShuffleConfig = {
  enableSmartShuffle: true,
  shuffleMode: "balanced",
};

/**
 * Calculate weight multiplier for a card based on its mastery level
 * Weight determines how many times a card appears in shuffled session
 *
 * @param masteryLevel - Card mastery level (0-100)
 * @param shuffleMode - Current shuffle mode
 * @returns Weight multiplier (1.0 base, increases with mastery)
 */
export function calculateCardWeight(
  masteryLevel: number,
  shuffleMode: ShuffleMode = "balanced",
): number {
  const normalized = Math.max(0, Math.min(100, masteryLevel));

  switch (shuffleMode) {
    case "mastery-focused":
      // Higher weights: 1.0 - 2.5x
      return 1 + (normalized / 100) * 1.5;

    case "challenge-first":
      // Lower weights: 0.5 - 1.2x (inverted, harder cards get higher weight)
      return 0.5 + ((100 - normalized) / 100) * 0.7;

    case "balanced":
    default:
      // Balanced: 1.0 - 1.8x
      return 1 + (normalized / 100) * 0.8;
  }
}

/**
 * Fisher-Yates shuffle algorithm for randomizing array
 * Creates a new array without modifying the original
 *
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create a weighted pool of cards where each card appears multiple times
 * based on its mastery level
 *
 * @param cards - Array of cards to weight
 * @param shuffleMode - Current shuffle mode
 * @returns Array with duplicates based on weight
 */
export function createWeightedCardPool(
  cards: CustomFlashCard[],
  shuffleMode: ShuffleMode = "balanced",
): Array<{ card: CustomFlashCard; originalIndex: number }> {
  const weightedPool: Array<{ card: CustomFlashCard; originalIndex: number }> =
    [];

  cards.forEach((card, originalIndex) => {
    const weight = calculateCardWeight(
      card.performance.masteryLevel,
      shuffleMode,
    );
    const count = Math.max(1, Math.round(weight));

    for (let i = 0; i < count; i++) {
      weightedPool.push({ card, originalIndex });
    }
  });

  return weightedPool;
}

/**
 * Perform smart shuffle on a list of cards
 * Returns shuffled cards with duplicates allowed
 *
 * @param cards - Cards to shuffle
 * @param config - Smart shuffle configuration
 * @returns Shuffled array with duplicates
 */
export function performSmartShuffle(
  cards: CustomFlashCard[],
  config: SmartShuffleConfig = DEFAULT_SMART_SHUFFLE_CONFIG,
): CustomFlashCard[] {
  if (!config.enableSmartShuffle || cards.length === 0) {
    return fisherYatesShuffle(cards);
  }

  // Create weighted pool
  const weightedPool = createWeightedCardPool(cards, config.shuffleMode);

  // Shuffle the weighted pool
  const shuffledPool = fisherYatesShuffle(weightedPool);

  return shuffledPool.map(item => item.card);
}

/**
 * Get statistics about a smart shuffled session
 * Shows which cards appeared how many times
 *
 * @param cards - Original cards
 * @param shuffledCards - Result from performSmartShuffle
 * @returns Statistics about the shuffled session
 */
export interface ShuffleSessionStats {
  totalCardsInSession: number;
  uniqueCardsIncluded: number;
  cardAppearances: Array<{
    cardId: string;
    front: string;
    back: string;
    masteryLevel: number;
    appearanceCount: number;
  }>;
}

export function getShuffleSessionStats(
  originalCards: CustomFlashCard[],
  shuffledCards: CustomFlashCard[],
): ShuffleSessionStats {
  const appearanceMap = new Map<string, number>();

  // Count appearances
  shuffledCards.forEach(card => {
    appearanceMap.set(card.id, (appearanceMap.get(card.id) ?? 0) + 1);
  });

  // Build detailed stats
  const cardAppearances = Array.from(appearanceMap.entries())
    .map(([cardId, count]) => {
      const original = originalCards.find(c => c.id === cardId);
      return {
        cardId,
        front: original?.front ?? "",
        back: original?.back ?? "",
        masteryLevel: original?.performance.masteryLevel ?? 0,
        appearanceCount: count,
      };
    })
    .sort((a, b) => b.appearanceCount - a.appearanceCount);

  return {
    totalCardsInSession: shuffledCards.length,
    uniqueCardsIncluded: appearanceMap.size,
    cardAppearances,
  };
}

/**
 * Calculate how mastery-weighted a shuffle session is
 * Shows percentage of session cards by mastery category
 *
 * @param sessionStats - Statistics from getShuffleSessionStats
 * @returns Breakdown by difficulty category
 */
export interface MasteryDistribution {
  hardCards: { count: number; percentage: number }; // mastery < 50%
  mediumCards: { count: number; percentage: number }; // mastery 50-80%
  easyCards: { count: number; percentage: number }; // mastery > 80%
}

export function getMasteryDistribution(
  sessionStats: ShuffleSessionStats,
): MasteryDistribution {
  const total = sessionStats.totalCardsInSession;
  const hard = sessionStats.cardAppearances.filter(c => c.masteryLevel < 50);
  const medium = sessionStats.cardAppearances.filter(
    c => c.masteryLevel >= 50 && c.masteryLevel <= 80,
  );
  const easy = sessionStats.cardAppearances.filter(c => c.masteryLevel > 80);

  return {
    hardCards: {
      count: hard.reduce((sum, c) => sum + c.appearanceCount, 0),
      percentage: Math.round(
        (hard.reduce((sum, c) => sum + c.appearanceCount, 0) / total) * 100,
      ),
    },
    mediumCards: {
      count: medium.reduce((sum, c) => sum + c.appearanceCount, 0),
      percentage: Math.round(
        (medium.reduce((sum, c) => sum + c.appearanceCount, 0) / total) * 100,
      ),
    },
    easyCards: {
      count: easy.reduce((sum, c) => sum + c.appearanceCount, 0),
      percentage: Math.round(
        (easy.reduce((sum, c) => sum + c.appearanceCount, 0) / total) * 100,
      ),
    },
  };
}
