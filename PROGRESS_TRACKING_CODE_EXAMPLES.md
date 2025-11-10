# Kana App - Code Examples & Patterns

This document contains important code examples from the existing codebase that should inform your progress tracking implementation.

## 1. Performance Metrics Type Definition

**File**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/types/customLists.ts`

```typescript
export interface CardPerformanceMetrics {
  viewCount: number;                    // Total times card viewed
  flipCount: number;                    // Total times card flipped
  correctCount: number;                 // Correct answers
  incorrectCount: number;               // Incorrect answers
  totalResponseTimeMs: number;          // Sum of all response times
  fastestResponseMs?: number;           // Best response time
  slowestResponseMs?: number;           // Worst response time
  lastReviewedAt?: Date;               // Timestamp of last practice
  masteryLevel: number;                 // 0-100 score
}

export interface CustomFlashCard {
  id: string;
  front: string;
  back: string;
  meaning?: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  lastReviewed?: Date;
  performance: CardPerformanceMetrics;
}

export interface CustomList {
  id: string;
  name: string;
  cards: CustomFlashCard[];
  createdAt: Date;
  updatedAt: Date;
  defaultDirection?: "front-to-back" | "back-to-front";
}
```

## 2. Mastery Level Calculation

**File**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/utils/performance.ts`

```typescript
/**
 * Calculate mastery level (0-100) based on performance metrics
 * Formula considers:
 * - View count (familiarity with card)
 * - Flip count (difficulty level)
 * - Correct vs incorrect ratio (success rate)
 * - Response time (speed)
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
```

## 3. Card Difficulty Classification

**File**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/utils/performance.ts`

```typescript
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
```

## 4. Svelte 5 Store Pattern

**File**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/stores/config.svelte.ts`

```typescript
export type ShuffleMode = "balanced" | "mastery-focused" | "challenge-first";
export type Direction = "front-to-back" | "back-to-front";
export type Language = "en" | "nb";

export interface AppConfig {
  enableSmartShuffle: boolean;
  defaultShuffleMode: ShuffleMode;
  maxShuffleSize: number;
  defaultDirection: Direction;
  displayMode: "flip" | "dual-side";
  language: Language;
  theme: "light" | "dark" | "auto";
  reducedMotion: boolean;
  version: string;
}

class ConfigStore {
  config = $state<AppConfig>(DEFAULT_CONFIG);
  isLoaded = $state<boolean>(false);

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    if (typeof window === "undefined") {
      this.isLoaded = true;
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppConfig;
        if (parsed.version !== CONFIG_VERSION) {
          this.config = this.migrateConfig(parsed);
        } else {
          this.config = { ...DEFAULT_CONFIG, ...parsed };
        }
      }
    } catch (error) {
      console.error("Error loading config from localStorage:", error);
      this.config = DEFAULT_CONFIG;
    }

    this.isLoaded = true;
  }

  private saveConfig() {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error("Error saving config to localStorage:", error);
    }
  }

  updateConfig(updates: Partial<AppConfig>) {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  resetConfig() {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
  }
}

export const configStore = new ConfigStore();
```

## 5. Database Storage Functions

**File**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/utils/db-storage.ts`

```typescript
// Convert database list and cards to CustomList type
function dbToCustomList(dbList: DbList, dbCards: DbCard[]): CustomList {
  return {
    id: dbList.id,
    name: dbList.name,
    cards: dbCards.map(dbCard => ({
      id: dbCard.id,
      front: dbCard.front,
      back: dbCard.back,
      meaning: dbCard.meaning || undefined,
      notes: dbCard.notes || undefined,
      tags: dbCard.tags,
      createdAt: new Date(dbCard.created_at),
      lastReviewed: dbCard.last_reviewed_at
        ? new Date(dbCard.last_reviewed_at)
        : undefined,
      performance: {
        viewCount: dbCard.view_count,
        flipCount: dbCard.flip_count,
        correctCount: dbCard.correct_count,
        incorrectCount: dbCard.incorrect_count,
        totalResponseTimeMs: dbCard.total_response_time_ms,
        fastestResponseMs: dbCard.fastest_response_ms || undefined,
        slowestResponseMs: dbCard.slowest_response_ms || undefined,
        lastReviewedAt: dbCard.last_reviewed_at
          ? new Date(dbCard.last_reviewed_at)
          : undefined,
        masteryLevel: dbCard.mastery_level,
      },
    })),
    createdAt: new Date(dbList.created_at),
    updatedAt: new Date(dbList.updated_at),
    defaultDirection: dbList.default_direction,
  };
}

// Get specific custom list by ID
export async function getCustomListFromDb(
  id: string,
  userId?: string,
): Promise<CustomList | null> {
  try {
    let query = supabaseAdmin
      .from("lists")
      .select("*")
      .eq("id", id)
      .single();

    const { data: list, error: listError } = await query;

    if (listError || !list) return null;

    // Check permissions
    if (userId) {
      if (list.user_id !== userId && !list.is_public) {
        return null; // User doesn't have access
      }
    } else if (!list.is_public) {
      return null; // Not public, can't access
    }

    // Get cards for this list
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from("cards")
      .select("*")
      .eq("list_id", id);

    if (cardsError) throw cardsError;

    return dbToCustomList(list as DbList, (cards as DbCard[]) || []);
  } catch (e) {
    console.error("Failed to load custom list from database:", e);
    return null;
  }
}
```

## 6. FlashCard Performance Tracking

**File**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/components/FlashCard.svelte`

```typescript
interface CardPerformanceData {
  cardId: string;
  responseTimeMs: number;
  flipCount: number;
  wasCorrect: boolean;
}

export let onPerformanceRecorded:
  | ((data: CardPerformanceData) => void)
  | undefined = undefined;

let cardShowTime: number = 0;
let flipCountThisSession: number = 0;
let performanceRecorded: boolean = false;

function onCardShown() {
  cardShowTime = Date.now();
  flipCountThisSession = 0;
  performanceRecorded = false;
}

function handleInteraction(e: PointerEvent | KeyboardEvent) {
  let shouldFlip = false;

  if (e instanceof KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      shouldFlip = true;
    }
  } else if (e instanceof PointerEvent && e.isPrimary) {
    e.preventDefault();
    shouldFlip = true;
  }

  if (shouldFlip) {
    flipCountThisSession += 1;

    // Record performance on first flip (first interaction with this card)
    if (!performanceRecorded && cardShowTime > 0 && onPerformanceRecorded) {
      const responseTimeMs = Date.now() - cardShowTime;
      const wasCorrect = responseTimeMs < 5000 && flipCountThisSession === 1;

      onPerformanceRecorded({
        cardId,
        responseTimeMs,
        flipCount: flipCountThisSession,
        wasCorrect,
      });

      performanceRecorded = true;
    }

    isFlipped = !isFlipped;
  }
}

onMount(() => {
  onCardShown();
});
```

## 7. Existing Statistics Component

**File**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/components/StatsDisplay.svelte`

```svelte
<script lang="ts">
  import type { CustomFlashCard } from "$lib/types/customLists";
  import {
    getAverageResponseTime,
    getSuccessRate,
    getCardDifficulty,
    formatTime,
  } from "$lib/utils/performance";

  export let cards: CustomFlashCard[] = [];
  export let showSessionStats: boolean = true;

  // Calculate stats
  $: totalViews = cards.reduce((sum, card) => sum + card.performance.viewCount, 0);
  $: totalFlips = cards.reduce((sum, card) => sum + card.performance.flipCount, 0);
  $: totalCorrect = cards.reduce((sum, card) => sum + card.performance.correctCount, 0);
  $: overallSuccessRate = totalViews === 0 ? 0 : Math.round((totalCorrect / totalViews) * 100);

  // Count difficulties
  $: difficulties = {
    new: cards.filter(c => getCardDifficulty(c.performance) === "new").length,
    easy: cards.filter(c => getCardDifficulty(c.performance) === "easy").length,
    medium: cards.filter(c => getCardDifficulty(c.performance) === "medium").length,
    hard: cards.filter(c => getCardDifficulty(c.performance) === "hard").length,
  };

  // Find masteries
  $: masteredCards = cards.filter(c => c.performance.masteryLevel >= 80).length;
</script>

{#if showSessionStats && totalViews > 0}
  <div class="stats-section">
    <h3>📊 Session Statistics</h3>
    <div class="stats-grid">
      <div class="stat">
        <div class="stat-value">{totalViews}</div>
        <div class="stat-label">Card Views</div>
      </div>
      <div class="stat">
        <div class="stat-value">{overallSuccessRate}%</div>
        <div class="stat-label">Success Rate</div>
      </div>
      <div class="stat">
        <div class="stat-value">{formatTime(averageResponseTime)}</div>
        <div class="stat-label">Avg. Time</div>
      </div>
      <div class="stat">
        <div class="stat-value">{totalFlips}</div>
        <div class="stat-label">Total Flips</div>
      </div>
    </div>
  </div>
{/if}
```

## 8. Responsive Component Pattern

**File**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/components/ListPage.svelte`

```svelte
<script lang="ts">
  import { configStore } from "$lib/stores/config.svelte";
  import { onMount } from "svelte";

  // Get default values from config store
  let enableSmartShuffle = $state(configStore.enableSmartShuffle);
  let displayMode = $state(configStore.displayMode);

  // Update local state when config changes
  $effect(() => {
    enableSmartShuffle = configStore.enableSmartShuffle;
    displayMode = configStore.displayMode;
  });

  // Computed values
  const progress = $derived(
    shuffledCards.length > 0
      ? `${currentIndex + 1} / ${shuffledCards.length}`
      : "0 / 0"
  );

  onMount(() => {
    isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;
  });
</script>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 720px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
  }
</style>
```

## 9. API Route Pattern (SvelteKit)

Create at: `/Users/sindreboyum/dev/personal/kana/apps/web/src/routes/api/progress/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const { session } = locals;

  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculate aggregated statistics
    const stats = {
      totalCards: 0,
      masteredCards: 0,
      averageMastery: 0,
      lastPracticed: null,
    };

    return json(stats);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
```

## 10. Layout Server Load Pattern

**File**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/routes/+layout.server.ts`

```typescript
import { extractLocaleFromRequest } from "$lib/paraglide/runtime";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals: { session }, request }) => {
  let locale = extractLocaleFromRequest(request);

  // If no locale cookie is set, detect from Accept-Language header
  const cookieHeader = request.headers.get('cookie');
  const hasLocaleCookie = cookieHeader?.includes('PARAGLIDE_LOCALE');

  if (!hasLocaleCookie) {
    const acceptLang = request.headers.get('accept-language');
    if (acceptLang) {
      const langCode = acceptLang.split(',')[0].split('-')[0].toLowerCase();
      locale = ['no', 'nn', 'nb'].includes(langCode) ? 'nb' : 'en';
    }
  }

  return {
    session,
    locale,
  };
};
```

## 11. Component Props Pattern

```svelte
<script lang="ts">
  interface Props {
    title: string;
    cards: Array<{ character?: string; romanization?: string } | CustomFlashCard>;
    backUrl?: string;
    backText?: string;
    initialDirection?: "front-to-back" | "back-to-front";
  }

  let {
    title,
    cards,
    backUrl = "/",
    backText = "← Hjem",
    initialDirection = configStore.defaultDirection,
  }: Props = $props();
</script>
```

## 12. CSS Custom Properties (Design System)

**File**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/app.css`

```css
:root {
  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  --font-mono: "Fira Mono", monospace;
  --font-heading: "Caveat Brush", cursive;
  
  --color-bg-primary: #e6e1c5;
  --color-heading: #395c6b;
  --color-accent: #80a4ed;
  --color-text: rgba(0, 0, 0, 0.7);
  --color-text-secondary: #6b7280;
  --color-surface: #f9fafb;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

---

These patterns should be followed when implementing progress tracking features.
