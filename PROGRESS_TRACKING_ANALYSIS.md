# Kana Language Learning App - Progress Tracking Feature Analysis

## Executive Summary

This document provides a thorough analysis of the Kana flashcard learning app codebase to support implementing a comprehensive progress tracking feature with statistics and performance graphs. The project is built with SvelteKit, uses Supabase for backend storage, and has a well-structured database schema already supporting performance metrics.

---

## 1. PROJECT STRUCTURE

### 1.1 Monorepo Architecture
Located at: `/Users/sindreboyum/dev/personal/kana`

```
kana/
├── apps/
│   ├── web/                  # Main SvelteKit application (primary focus)
│   └── admin/                # Admin dashboard (separate app)
├── packages/
│   └── db-services/          # Shared database services
├── turbo.json                # Turborepo configuration
└── package.json              # Root workspace config
```

**Package Manager**: npm 10.9.0
**Node Version**: 18+ (see .nvmrc)

### 1.2 Web App Structure

**Root**: `/Users/sindreboyum/dev/personal/kana/apps/web/`

**Key Directories**:

```
apps/web/
├── src/
│   ├── lib/
│   │   ├── components/       # Reusable Svelte components
│   │   ├── stores/           # Svelte 5 rune-based state management
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions and helpers
│   │   ├── paraglide/        # i18n configuration
│   │   ├── supabase.ts       # Client Supabase setup
│   │   ├── supabase.server.ts # Server Supabase setup
│   │   └── data/             # Static data files
│   ├── routes/               # SvelteKit file-based routing
│   ├── app.css               # Global styles
│   ├── app.html              # HTML entry point
│   ├── app.d.ts              # Type declarations
│   ├── hooks.server.ts       # Server hooks
│   ├── hooks.ts              # Client hooks
│   └── service-worker.ts     # PWA service worker
├── supabase/
│   ├── migrations/           # Database migration files
│   └── seed.sql              # Seed data
├── svelte.config.js          # SvelteKit configuration
└── vite.config.ts            # Vite build configuration
```

### 1.3 Main Routes

**User-facing routes** in `/Users/sindreboyum/dev/personal/kana/apps/web/src/routes/`:

- `/` - Home page with kana mode selection
- `/hiragana` - Hiragana practice
- `/katakana` - Katakana practice
- `/egendefinert` - Custom lists management
- `/egendefinert/new` - Create new custom list
- `/egendefinert/[listId]` - Practice specific custom list
- `/egendefinert/[listId]/edit` - Edit custom list
- `/egendefinert/combined` - Practice multiple selected lists
- `/login` - Login page
- `/logout` - Logout endpoint
- `/auth/callback` - OAuth callback

**New routes needed for progress tracking**:
- `/progress` or `/stats` - Main progress dashboard
- `/progress/[listId]` - List-specific progress details
- `/api/progress/...` - API endpoints for statistics

---

## 2. DATABASE SCHEMA

### 2.1 Current Supabase Schema

**Location**: `/Users/sindreboyum/dev/personal/kana/apps/web/supabase/migrations/`

**Migrations**:
1. `20250109000000_initial_schema.sql` - Profiles and lists tables
2. `20250109000001_custom_lists_schema.sql` - Cards table with performance metrics
3. `20250109000002_allow_null_user_for_examples.sql` - Support for system example lists
4. `20250109000003_change_id_to_text.sql` - Custom ID format (timestamp-based)
5. `20250109000004_add_admin_roles.sql` - Admin role support

### 2.2 Key Tables

#### **Profiles Table**
```sql
CREATE TABLE public.profiles (
  id text PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',  -- 'user' or 'admin'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### **Lists Table** (Custom flashcard lists)
```sql
CREATE TABLE public.lists (
  id text PRIMARY KEY,
  user_id text REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL for system lists
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  default_direction text CHECK (default_direction IN ('front-to-back', 'back-to-front')),
  is_example boolean DEFAULT false,
  is_test_data boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### **Cards Table** (Individual flashcards)
```sql
CREATE TABLE public.cards (
  id text PRIMARY KEY,
  list_id text REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  front text NOT NULL,
  back text NOT NULL,
  meaning text,
  notes text,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_reviewed_at timestamptz,
  
  -- Performance metrics
  view_count integer DEFAULT 0,
  flip_count integer DEFAULT 0,
  correct_count integer DEFAULT 0,
  incorrect_count integer DEFAULT 0,
  total_response_time_ms bigint DEFAULT 0,
  fastest_response_ms integer,
  slowest_response_ms integer,
  mastery_level integer DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100)
);
```

### 2.3 Current Performance Metrics in Database

The `cards` table already tracks:
- `view_count` - Total views
- `flip_count` - Total flips
- `correct_count` - Correct answers
- `incorrect_count` - Incorrect answers
- `total_response_time_ms` - Sum of response times
- `fastest_response_ms` - Best response time
- `slowest_response_ms` - Worst response time
- `mastery_level` - Calculated 0-100 score
- `last_reviewed_at` - Timestamp of last practice

### 2.4 Missing Tables for Session Tracking

**Recommended new table for detailed session history**:
```sql
CREATE TABLE public.practice_sessions (
  id text PRIMARY KEY,
  user_id text REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  list_id text REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  
  -- Session statistics
  cards_attempted integer DEFAULT 0,
  cards_mastered integer DEFAULT 0,
  average_response_time_ms integer,
  total_response_time_ms bigint,
  success_rate integer DEFAULT 0,  -- 0-100
  
  -- Session metadata
  shuffle_mode text DEFAULT 'balanced',
  display_mode text DEFAULT 'flip',
  direction text DEFAULT 'front-to-back',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.session_card_attempts (
  id text PRIMARY KEY,
  session_id text REFERENCES public.practice_sessions(id) ON DELETE CASCADE NOT NULL,
  card_id text REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  attempt_number integer,
  response_time_ms integer,
  was_correct boolean,
  created_at timestamptz DEFAULT now()
);
```

---

## 3. FRONTEND FRAMEWORK & ROUTING

### 3.1 Framework Stack

**Framework**: SvelteKit 2.47.1 with Svelte 5.41.0
**Build Tool**: Vite 7.1.10
**Routing**: File-based SvelteKit routing
**Adapter**: Vercel (@sveltejs/adapter-vercel 6.0.0)
**Deployment**: Vercel

### 3.2 State Management

**Svelte 5 Runes** (reactive state):

**Auth Store** - `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/stores/auth.svelte.ts`
```typescript
class AuthStore {
  user = $state<User | null>(null);
  session = $state<Session | null>(null);
  isGuest = $state<boolean>(false);
  loading = $state<boolean>(true);
  
  // Methods
  signInWithGitHub()
  continueAsGuest()
  linkGitHubAccount()
  signOut()
  get isAuthenticated()
  get isRegistered()
}

export const authStore = new AuthStore();
```

**Config Store** - `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/stores/config.svelte.ts`
```typescript
class ConfigStore {
  config = $state<AppConfig>(...);
  isLoaded = $state<boolean>(false);
  
  // Properties
  enableSmartShuffle: boolean
  defaultShuffleMode: ShuffleMode
  maxShuffleSize: number
  defaultDirection: Direction
  displayMode: DisplayMode
  language: Language
  theme: Theme
  reducedMotion: boolean
  
  // Methods
  updateConfig(updates: Partial<AppConfig>)
  resetConfig()
}

export const configStore = new ConfigStore();
```

### 3.3 Key Layout Components

**Main Layout** - `/Users/sindreboyum/dev/personal/kana/apps/web/src/routes/+layout.svelte`
- Manages locale/language switching
- Registers PWA service worker
- Uses Svelte 5 `$effect` for reactive language detection

**Layout Server Load** - `/Users/sindreboyum/dev/personal/kana/apps/web/src/routes/+layout.server.ts`
```typescript
export const load: LayoutServerLoad = async ({ locals: { session }, request }) => {
  // Detects locale from cookie or Accept-Language header
  return { session, locale };
};
```

### 3.4 Navigation Pattern

Uses SvelteKit's `goto` function with custom link click handler:
```typescript
import { goto } from "$app/navigation";

// Optimized for mobile with pointer events
export function handleLinkClick(
  e: PointerEvent,
  href: string,
  gotoFn: (url: string) => void
) {
  // Checks for modifier keys, prevents double-tap zoom
  if (!e.isPrimary || e.ctrlKey || e.metaKey || ...) return;
  e.preventDefault();
  gotoFn(href);
}
```

---

## 4. EXISTING DATA & PERFORMANCE TRACKING

### 4.1 Performance Metrics Tracked

**Location**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/types/customLists.ts`

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

### 4.2 Performance Calculation Utilities

**Location**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/utils/performance.ts`

**Key Functions**:

```typescript
// Creates empty performance metrics
export function createEmptyPerformanceMetrics(): CardPerformanceMetrics

// Records card view with timing
export function recordCardView(
  metrics: CardPerformanceMetrics,
  responseTimeMs: number,
  flipCount: number
): CardPerformanceMetrics

// Calculates mastery level (0-100)
// Formula: Success rate (60pts) + Consistency (20pts) + Speed (20pts)
export function calculateMasteryLevel(
  metrics: CardPerformanceMetrics
): number

// Determines card difficulty
export function getCardDifficulty(
  metrics: CardPerformanceMetrics
): "new" | "easy" | "medium" | "hard"

// Gets average response time
export function getAverageResponseTime(
  metrics: CardPerformanceMetrics
): number

// Gets success rate as percentage
export function getSuccessRate(
  metrics: CardPerformanceMetrics
): number

// Formats milliseconds to human-readable time
export function formatTime(ms: number): string
```

### 4.3 Database Storage Functions

**Location**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/utils/db-storage.ts`

```typescript
// Get all custom lists for user
export async function getAllCustomListsFromDb(userId?: string): Promise<CustomList[]>

// Get specific custom list by ID
export async function getCustomListFromDb(
  id: string,
  userId?: string
): Promise<CustomList | null>

// Save or update custom list
export async function saveCustomListToDb(
  list: CustomList,
  userId: string,
  isExample?: boolean,
  isTestData?: boolean
): Promise<void>

// Delete custom list
export async function deleteCustomListFromDb(
  id: string,
  userId: string
): Promise<void>

// Get all example lists
export async function getExampleLists(): Promise<CustomList[]>
```

### 4.4 Existing Statistics Component

**Location**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/components/StatsDisplay.svelte`

**Features**:
- Session statistics: Views, Success Rate, Avg Response Time, Flips
- Card difficulty distribution (New, Easy, Medium, Hard)
- Mastery progress bar (cards >= 80% mastery)
- Cards needing practice (bottom 3 cards by mastery)

**Styling**:
- Cards with shadows and rounded corners
- Progress bar with gradient
- Responsive grid layout
- Color-coded badges (green=easy, orange=medium, red=hard)

---

## 5. UI COMPONENT PATTERNS

### 5.1 Component Library

**Svelte 5 Component Pattern** - Using runes for state:

**Key Components**:

1. **Button** (`Button.svelte`)
   - Custom styled button with emoji support
   - Props: `onPointerDown`, `onKeyDown`

2. **FlashCard** (`FlashCard.svelte`)
   - Interactive flashcard with flip animation
   - Dual-side display mode (new feature)
   - Performance tracking callback
   - Props:
     - `front`, `back` - Card content
     - `meaning`, `notes` - Optional metadata
     - `isFlipped` - State binding
     - `displayMode` - "flip" or "dual-side"
     - `cardId` - For tracking
     - `onPerformanceRecorded` - Callback with timing data

3. **ListPage** (`ListPage.svelte`)
   - Container for practice session
   - Handles card navigation and shuffling
   - Props:
     - `title` - Practice session title
     - `cards` - Array of flashcards
     - `initialDirection` - front-to-back or back-to-front
     - `backUrl` - Navigation back link

4. **StatsDisplay** (`StatsDisplay.svelte`)
   - Comprehensive statistics visualization
   - Grid layouts with cards
   - Responsive design
   - Props:
     - `cards` - Array of CustomFlashCards
     - `showSessionStats` - Toggle session stats

5. **CustomListItem** (`CustomListItem.svelte`)
   - List card with actions menu
   - Multi-select support
   - Props:
     - `list` - CustomList data
     - `onPractice`, `onEdit`, `onShare`, `onDuplicate`, `onExport`, `onDelete`
     - `multiSelectMode` - Boolean
     - `isSelected` - Boolean

6. **ConfigModal** (`ConfigModal.svelte`)
   - Settings dialog
   - Features: shuffle mode, direction, display mode, language
   - Export/import data
   - Reset to defaults

### 5.2 Styling System

**CSS Custom Properties** (in `/Users/sindreboyum/dev/personal/kana/apps/web/src/app.css`):

```css
:root {
  --font-body: System fonts stack
  --font-mono: "Fira Mono", monospace
  --font-heading: "Caveat Brush", cursive
  --color-bg-primary: #e6e1c5
  --color-heading: #395c6b
  --color-accent: #80a4ed
  --color-text: rgba(0, 0, 0, 0.7)
  --color-text-secondary: #6b7280
  --color-surface: #f9fafb
  --color-success: #10b981
  --color-warning: #f59e0b
  --color-danger: #ef4444
}
```

**Component Styling Patterns**:
- Rounded corners (30px, 25px, 20px, 15px)
- Box shadows: `0 8px 20px rgba(57, 92, 107, 0.15)`
- Gradients for cards and buttons
- Smooth transitions (0.2s - 0.6s)
- Mobile-first responsive design

### 5.3 Accessibility Features

- Semantic HTML (buttons, links, dialogs)
- ARIA labels for interactive elements
- Keyboard navigation support
- Touch-optimized click targets
- Pointer event handling for mobile

---

## 6. EXISTING STATISTICS & ANALYTICS

### 6.1 Current Statistics Features

**In-Session Statistics** (StatsDisplay.svelte):
- Total card views in session
- Overall success rate percentage
- Average response time
- Total flips count
- Difficulty distribution breakdown
- Mastery progress percentage
- Cards needing practice (bottom performers)

### 6.2 Performance Data Available

**Card-Level Data**:
- View count
- Response times (avg, min, max)
- Success/failure counts
- Flip counts
- Mastery level (0-100)
- Last reviewed timestamp

**List-Level Data** (derivable from cards):
- Average mastery across all cards
- Total practice time
- Average session success rate
- Card count by difficulty
- Days since last practice per card

### 6.3 Missing Analytics

**Session-level tracking** (not yet stored):
- Session duration
- Session date/time
- Cards practiced in session
- Session-specific statistics
- Long-term trends

**User-level analytics** (not yet implemented):
- Total practice time
- Favorite lists
- Overall mastery progression
- Learning streaks
- Practice frequency

**Visualization gaps**:
- Time-series graphs
- Weekly/monthly statistics
- Progress over time
- Comparison views
- Goal tracking

---

## 7. TECHNICAL RECOMMENDATIONS FOR PROGRESS TRACKING

### 7.1 Technology Stack to Use

**Already in place**:
- SvelteKit for routing and SSR
- Supabase for database and real-time updates
- TypeScript for type safety
- Svelte 5 runes for state management

**Recommended additions**:
- **Chart library**: Chart.js or Recharts (lightweight)
- **Date utilities**: date-fns (already in some SvelteKit projects)
- **Data formatting**: Already have utilities for time formatting

### 7.2 Architecture Recommendations

**Backend (API Routes)**:
- Create `/src/routes/api/progress/` for statistics endpoints
- Use server-side calculations for aggregations
- Implement proper error handling and authentication

**Frontend**:
- New store for progress/statistics state
- New page component for dashboard
- Reusable chart components
- Time period filters (today, week, month, all-time)

**Database**:
- Add `practice_sessions` table for detailed history
- Add `session_card_attempts` table for per-card session data
- Create database views for common aggregations
- Add indexes for query performance

### 7.3 Performance Considerations

**Current State Management**:
- Stores are loaded on client-side
- LocalStorage used for config persistence
- Supabase client initialized on load

**For Progress Tracking**:
- Consider server-side pagination for large datasets
- Implement caching layer for expensive calculations
- Use database queries for time-range aggregations
- Avoid loading all historical data at once

---

## 8. KEY FILES & DIRECTORIES REFERENCE

### Type Definitions
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/types/customLists.ts`
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/types/database.types.ts`

### Stores (State Management)
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/stores/auth.svelte.ts`
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/stores/config.svelte.ts`

### Components
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/components/StatsDisplay.svelte` (existing stats)
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/components/ListPage.svelte` (practice interface)
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/components/FlashCard.svelte` (card with perf tracking)

### Utilities
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/utils/performance.ts` (calculations)
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/utils/db-storage.ts` (database functions)
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/utils/interaction.ts` (event handlers)

### Database
- `/Users/sindreboyum/dev/personal/kana/apps/web/supabase/migrations/20250109000001_custom_lists_schema.sql`

### Routes
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/routes/` (main routes)
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/routes/+layout.svelte` (main layout)
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/routes/+layout.server.ts` (server data)

### Config
- `/Users/sindreboyum/dev/personal/kana/apps/web/svelte.config.js`
- `/Users/sindreboyum/dev/personal/kana/apps/web/vite.config.ts`
- `/Users/sindreboyum/dev/personal/kana/apps/web/package.json`

### Styling
- `/Users/sindreboyum/dev/personal/kana/apps/web/src/app.css` (global styles)

---

## 9. IMPLEMENTATION ROADMAP

### Phase 1: Database & Backend
1. Create migration for `practice_sessions` and `session_card_attempts` tables
2. Implement database views for common queries
3. Create API endpoints for statistics
4. Update `recordCardView` to track session data

### Phase 2: Frontend - Data Layer
1. Create progress store for state management
2. Add server-side load functions for progress routes
3. Implement API call utilities

### Phase 3: Frontend - UI Components
1. Create base chart components
2. Build progress dashboard page
3. Add list-specific progress details
4. Implement time period filters

### Phase 4: Integration & Polish
1. Connect components to real data
2. Performance optimization
3. Error handling and edge cases
4. Testing

---

## 10. CODE SNIPPETS & EXAMPLES

### Current Card Performance Tracking (FlashCard.svelte)
```typescript
// Track each flip and record performance on first flip
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

    // Record performance on first flip
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
```

### Mastery Level Calculation (performance.ts)
```typescript
export function calculateMasteryLevel(metrics: CardPerformanceMetrics): number {
  if (metrics.viewCount === 0) return 0;

  // Base score from correct/incorrect ratio (60 points)
  const successRate = metrics.correctCount / metrics.viewCount;
  let score = successRate * 60;

  // Consistency bonus (20 points)
  if (metrics.viewCount >= 3 && metrics.fastestResponseMs && metrics.slowestResponseMs) {
    const timeVariation = metrics.slowestResponseMs - metrics.fastestResponseMs;
    const avgTime = metrics.totalResponseTimeMs / metrics.viewCount;
    const consistency = Math.max(0, 1 - timeVariation / (avgTime * 5));
    score += consistency * 20;
  }

  // Speed bonus (20 points)
  const avgResponseTime = metrics.totalResponseTimeMs / metrics.viewCount;
  if (avgResponseTime < 3000) {
    score += 20;
  } else if (avgResponseTime < 5000) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}
```

---

## 11. SUMMARY

The Kana app has a solid foundation for progress tracking:

**Strengths**:
- Well-structured database schema with performance metrics
- Existing calculation utilities for mastery and difficulty
- Type-safe TypeScript throughout
- Svelte 5 runes for reactive state
- Clean component architecture
- Supabase integration for data persistence
- Already captures detailed performance data per card

**What's Needed**:
- Session-level history tracking
- Progress visualization components (charts/graphs)
- Progress dashboard pages
- API endpoints for statistics
- Time-period filtering
- Historical trend analysis
- User-level aggregations

**Best Practices to Follow**:
- Use existing Svelte 5 rune patterns for new stores
- Match existing component styling and layout patterns
- Leverage existing performance calculation functions
- Maintain TypeScript type safety
- Support both mobile and desktop interfaces
- Use Supabase for data persistence
- Follow existing accessibility patterns

