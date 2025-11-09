# Gamification Phase 2 - Implementation Guide

## Overview

Phase 2 implements the **Scoring System** and introduces **Smart Shuffle** - an intelligent shuffling algorithm that gives more screen time to well-known cards, keeping studying engaging while reinforcing mastery.

## What Will Be Implemented

### 1. **Scoring System**

Track and display points earned during study sessions based on response times and performance.

### 2. **Smart Shuffle with Increased Frequency for Well-Known Cards**

Intelligently randomize card order while weighting well-mastered cards to appear more frequently in shuffled sessions.

## Smart Shuffle Deep Dive

### Core Concept

Instead of simple randomization, Smart Shuffle uses a **weight-based algorithm** where cards with higher mastery levels appear more frequently in a shuffled session. This achieves several goals:

- **Confidence Building**: Students see their mastered cards frequently, reinforcing that they're making progress
- **Spaced Review**: Prevents forgetting of mastered content through periodic repetition
- **Engagement**: Mixes familiar content (confidence boost) with challenging content (growth focus)
- **Measurement**: Shows tangible evidence that well-known cards are working

### Weight Calculation

Three shuffle modes are supported:

**Balanced Mode (Default):**

```
weight = 1 + (masteryLevel / 100) * 0.8
// Mastery 0% → 1.0x (appears once)
// Mastery 50% → 1.4x (appears 1-2 times)
// Mastery 100% → 1.8x (appears ~2 times)
```

**Mastery-Focused Mode:**

```
weight = 1 + (masteryLevel / 100) * 1.5
// Emphasizes repetition of well-known cards
// Mastery 100% → 2.5x (appears 2-3 times)
```

**Challenge-First Mode:**

```
weight = 0.5 + ((100 - masteryLevel) / 100) * 0.7
// Inverts the logic - harder cards appear more
// Mastery 0% (hard) → 1.2x
// Mastery 100% (easy) → 0.5x (appears once)
```

### Algorithm Steps

1. **Calculate Weight**: For each card, determine multiplier based on mastery + shuffle mode
2. **Create Weighted Pool**: Duplicate cards in array based on their weight
3. **Shuffle Pool**: Use Fisher-Yates algorithm to randomize weighted pool
4. **Cap Session**: Return top N cards (default 25) from shuffled pool
5. **Track Appearances**: Record how many times each original card appeared

### Example Session

**Original Cards (11 total):**

- 3 Hard cards (mastery 20-40%)
- 4 Medium cards (mastery 50-70%)
- 4 Easy cards (mastery 85-95%)

**Balanced Mode Weights:**

- Hard: ~1.16-1.32x → 2 appearances each (6 total)
- Medium: ~1.4-1.56x → 1-2 appearances each (5-6 total)
- Easy: ~1.68-1.76x → 1-2 appearances each (5-6 total)

**Shuffled Session (20 cards max):**

- Hard cards: 6 appearances
- Medium cards: 6 appearances
- Easy cards: 8 appearances
  Total: 20 unique cards in one session (with repeats)

## Implementation Files

### New Files Created

#### `src/lib/utils/smartShuffle.ts`

Complete Smart Shuffle implementation with:

- `calculateCardWeight()` - Determine weight for a card
- `performSmartShuffle()` - Main function to shuffle cards
- `createWeightedCardPool()` - Build weighted duplicate pool
- `fisherYatesShuffle()` - Randomization algorithm
- `getShuffleSessionStats()` - Analyze a shuffled session
- `getMasteryDistribution()` - Get breakdown by difficulty

**Key Types:**

```typescript
interface SmartShuffleConfig {
  enableSmartShuffle: boolean;
  shuffleMode: "balanced" | "mastery-focused" | "challenge-first";
  maxShuffleSize: number; // 25 default
}

interface ShuffleSessionStats {
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
```

### Files to Modify

#### `src/lib/types/customLists.ts`

Add session/shuffle related interfaces:

```typescript
export interface StudySession {
  sessionId: string;
  listId: string;
  startedAt: Date;
  completedAt?: Date;
  totalPoints: number;
  cardsReviewed: number;
  uniqueCardsReviewed: number;
  shuffleMode: ShuffleMode;
  cardPerformances: SessionCardRecord[];
}

export interface SessionCardRecord {
  cardId: string;
  appearanceCount: number; // How many times in this session
  pointsEarned: number;
  averageResponseTime: number;
}
```

#### `src/lib/utils/storage.ts`

Add session storage functions:

```typescript
export function saveMostRecentSession(session: StudySession): void;
export function getMostRecentSession(listId: string): StudySession | null;
export function getSessionHistory(listId: string): StudySession[];
```

#### `src/lib/components/FlashCard.svelte`

Potential enhancement for session tracking (Phase 2 extension):

- May track which appearance count a card is on
- Display "2nd time" badge for repeated cards

### How to Integrate Smart Shuffle

#### In a Custom List Page

```svelte
<script lang="ts">
  import { performSmartShuffle } from "$lib/utils/smartShuffle";
  import type { SmartShuffleConfig } from "$lib/utils/smartShuffle";

  let cards: CustomFlashCard[] = /* ... */;

  const shuffleConfig: SmartShuffleConfig = {
    enableSmartShuffle: true,
    shuffleMode: "balanced",
    maxShuffleSize: 25,
  };

  // Perform smart shuffle
  let shuffledCards = performSmartShuffle(cards, shuffleConfig);

  // Display shuffled cards to user
</script>

<!-- UI for shuffle mode selection -->
<select bind:value={shuffleConfig.shuffleMode}>
  <option value="balanced">Balanced (Default)</option>
  <option value="mastery-focused">Mastery Focus</option>
  <option value="challenge-first">Challenge First</option>
</select>

<button onclick={() => shuffledCards = performSmartShuffle(cards, shuffleConfig)}>
  🔀 Smart Shuffle
</button>
```

#### Displaying Shuffle Stats

```svelte
<script lang="ts">
  import { getShuffleSessionStats, getMasteryDistribution } from "$lib/utils/smartShuffle";

  let stats = getShuffleSessionStats(originalCards, shuffledCards);
  let distribution = getMasteryDistribution(stats);
</script>

<div class="shuffle-stats">
  <p>Session: {stats.totalCardsInSession} cards ({stats.uniqueCardsIncluded} unique)</p>

  <p>Distribution:</p>
  <ul>
    <li>Hard cards: {distribution.hardCards.count} ({distribution.hardCards.percentage}%)</li>
    <li>Medium cards: {distribution.mediumCards.count} ({distribution.mediumCards.percentage}%)</li>
    <li>Easy cards: {distribution.easyCards.count} ({distribution.easyCards.percentage}%)</li>
  </ul>

  <details>
    <summary>Card Appearances</summary>
    {#each stats.cardAppearances as appearance}
      <div>
        <span>{appearance.front} ({appearance.masteryLevel}%)</span>
        <span>× {appearance.appearanceCount}</span>
      </div>
    {/each}
  </details>
</div>
```

## Testing Smart Shuffle

### Manual Testing

1. **Create test list** with cards at various mastery levels:
   - 2 new cards (mastery 0%)
   - 3 medium cards (mastery 50%)
   - 3 mastered cards (mastery 90%)

2. **Test each shuffle mode:**
   - Balanced: Should see ~even mix
   - Mastery-focused: Should see more mastered cards
   - Challenge-first: Should see more new/medium cards

3. **Check statistics:**
   - Verify card appearance counts match weights
   - Verify session size doesn't exceed maxShuffleSize
   - Verify unique card count is accurate

### Unit Tests to Write

```typescript
// Test weight calculation
test("calculateCardWeight returns correct weights", () => {
  // Verify balanced mode returns 1.0-1.8
  // Verify mastery-focused returns 1.0-2.5
  // Verify challenge-first returns inverted weights
});

// Test shuffling produces expected distribution
test("performSmartShuffle respects mastery weights", () => {
  // Create cards with known mastery levels
  // Run smart shuffle
  // Verify high-mastery cards appear more frequently
});

// Test Fisher-Yates creates proper distribution
test("fisherYatesShuffle is random", () => {
  // Run multiple times, verify different results
});

// Test session statistics
test("getShuffleSessionStats calculates correctly", () => {
  // Verify total cards
  // Verify unique count
  // Verify appearance counts sum to total
});
```

## User Experience Enhancements

### UI Elements to Add

1. **Shuffle Mode Selector:**
   - Dropdown in card selection area
   - Icons for each mode (🎲, 🧠, ⚙️)

2. **Session Summary:**
   - Shows total cards in session vs. unique
   - Breakdown by difficulty (hard/medium/easy)
   - Which cards appeared most/least

3. **Card Appearance Badges:**
   - "2nd time", "3rd time" badges on cards that repeat
   - Visual highlight (glow/pulse) on repeat appearances
   - "You're maintaining this! 🌟" message

4. **Statistics After Session:**
   - Total points earned
   - Average response time
   - Cards practiced breakdown
   - Progress on mastered cards

## Configuration & Customization

### Smart Shuffle Settings

Add to user preferences (future Phase 3):

```typescript
interface UserPreferences {
  smartShuffleEnabled: boolean;
  preferredShuffleMode: ShuffleMode;
  maxCardsPerSession: number; // Default 25
  showAppearanceBadges: boolean; // Show "2nd time"
  focusOnDifficultCards: boolean; // Auto-select challenge-first
}
```

## Phase 2 Implementation Timeline

**Week 1:**

- [ ] Implement smart shuffle utility (`smartShuffle.ts`)
- [ ] Add scoring system hooks
- [ ] Write unit tests for shuffle algorithm

**Week 2:**

- [ ] Integrate smart shuffle into custom list pages
- [ ] Add shuffle mode selector UI
- [ ] Display session statistics
- [ ] Add appearance count badges

**End of Phase 2:**

- [ ] All cards can be shuffled with smart algorithm
- [ ] Statistics displayed after sessions
- [ ] User can select shuffle mode
- [ ] Scoring system ready for Phase 3

## Next Steps (Phase 3+)

- Session persistence (save/load study sessions)
- Points/scoring system with visual display
- Achievements for maintaining streaks
- Daily challenges based on difficult cards
- Leaderboards and progress tracking

## Notes

- Smart shuffle works with **custom lists** (Phase 2)
- Built-in Hiragana/Katakana lists need conversion to custom format for shuffle (Phase 4)
- Shuffle session is **deterministic** when same cards are used (no seed specified, uses Math.random)
- Card performance data used by shuffle comes from **Phase 1 implementation**
- Smart shuffle is **non-destructive** - doesn't modify original card data
