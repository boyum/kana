# Kana Progress Tracking - Quick Reference Guide

## Key File Locations

### Core Performance & Data Files
- **Performance calculations**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/utils/performance.ts`
- **Type definitions**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/types/customLists.ts`
- **Database functions**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/utils/db-storage.ts`
- **Existing stats component**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/components/StatsDisplay.svelte`

### Database Schema
- **Cards performance schema**: `/Users/sindreboyum/dev/personal/kana/apps/web/supabase/migrations/20250109000001_custom_lists_schema.sql`
- **Admin setup & roles**: `/Users/sindreboyum/dev/personal/kana/apps/web/supabase/migrations/20250109000004_add_admin_roles.sql`

### State Management
- **Auth store**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/stores/auth.svelte.ts`
- **Config store**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/lib/stores/config.svelte.ts`
- **Global styles**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/app.css`

### Routes Directory
- **Main routes**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/routes/`
- **Custom lists**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/routes/egendefinert/`
- **API routes**: `/Users/sindreboyum/dev/personal/kana/apps/web/src/routes/api/`

## Currently Tracked Data (Per Card)

In the `cards` table in Supabase:

| Field | Type | Purpose |
|-------|------|---------|
| view_count | integer | How many times card was viewed |
| flip_count | integer | How many times card was flipped |
| correct_count | integer | Number of correct attempts |
| incorrect_count | integer | Number of incorrect attempts |
| total_response_time_ms | bigint | Sum of all response times |
| fastest_response_ms | integer | Best response time |
| slowest_response_ms | integer | Worst response time |
| mastery_level | integer (0-100) | Calculated mastery score |
| last_reviewed_at | timestamptz | Timestamp of last practice |

## Key Functions Available

### performance.ts Functions

```typescript
createEmptyPerformanceMetrics()         // Initialize metrics
recordCardView(metrics, responseTime, flipCount)  // Update metrics after practice
calculateMasteryLevel(metrics)          // Calculate 0-100 mastery score
getCardDifficulty(metrics)              // Returns: "new" | "easy" | "medium" | "hard"
getAverageResponseTime(metrics)         // Average response time in ms
getSuccessRate(metrics)                 // Success rate as 0-100
formatTime(ms)                          // Convert ms to readable format (e.g., "2.5s")
```

### db-storage.ts Functions

```typescript
getAllCustomListsFromDb(userId?)       // Get all user's lists
getCustomListFromDb(id, userId?)       // Get single list with cards
saveCustomListToDb(list, userId, isExample?, isTestData?)  // Save list
deleteCustomListFromDb(id, userId)     // Delete list
getExampleLists()                       // Get system example lists
```

## Mastery Level Formula

```
Base Score = (success_rate) * 60

Consistency Bonus (0-20 points):
  - If >= 3 views: 1 - (variation / (avg_time * 5))

Speed Bonus (0-20 points):
  - If avg < 3s: +20
  - If avg < 5s: +10
  - Else: 0

Final = min(100, round(base + consistency + speed))
```

## Difficulty Classification

| Metric | New | Easy | Medium | Hard |
|--------|-----|------|--------|------|
| Views | 0 | >0 | >0 | >0 |
| Success Rate | N/A | >70% | 30-70% | <30% |
| Flip Ratio | N/A | <=0.5 | 0.5-1.5 | >1.5 |

## Component Patterns

### Store Pattern (Svelte 5 Runes)
```typescript
class MyStore {
  data = $state<Type>(initialValue);
  
  update(value: Type) {
    this.data = value;
  }
  
  get computedValue() {
    return this.data;
  }
}

export const myStore = new MyStore();
```

### Component Pattern
```svelte
<script lang="ts">
  let { prop } = $props();
  let state = $state(false);
  
  $effect(() => {
    // Reactive code
  });
</script>
```

## Styling Variables

```css
--font-heading: "Caveat Brush", cursive
--color-accent: #80a4ed
--color-heading: #395c6b
--color-success: #10b981
--color-warning: #f59e0b
--color-danger: #ef4444
```

## Dashboard/Progress Route Ideas

1. **Main Progress Dashboard** (`/progress`)
   - Overall statistics card
   - Lists ranked by mastery
   - Recent practice sessions
   - Weekly practice chart

2. **List-Specific Progress** (`/progress/[listId]`)
   - List overview stats
   - Card-level breakdown
   - Performance history graph
   - Practice timeline

3. **API Endpoints Needed**
   - `GET /api/progress/summary` - Overall stats
   - `GET /api/progress/list/[id]` - List stats
   - `GET /api/progress/history` - Practice history
   - `GET /api/progress/cards/[id]` - Card stats

## Database Additions Needed

Create new tables for session tracking:

```sql
-- practice_sessions table
CREATE TABLE public.practice_sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  list_id text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  cards_attempted integer,
  success_rate integer,
  total_response_time_ms bigint,
  shuffle_mode text,
  display_mode text
);

-- session_card_attempts table
CREATE TABLE public.session_card_attempts (
  id text PRIMARY KEY,
  session_id text NOT NULL,
  card_id text NOT NULL,
  response_time_ms integer,
  was_correct boolean,
  created_at timestamptz DEFAULT now()
);
```

## Authentication & Authorization

- Users logged in via GitHub OAuth or as guests
- Each card/list has `user_id` that determines ownership
- Admin role for managing public lists
- RLS policies enforce user isolation

## Responsive Design Breakpoint

Main breakpoint: **720px**

```css
@media (max-width: 720px) {
  /* Mobile-first adjustments */
}
```

## Tech Stack Summary

- **Framework**: SvelteKit 2.47.1
- **Svelte Version**: 5.41.0
- **Backend**: Supabase
- **Build**: Vite 7.1.10
- **Deployment**: Vercel
- **Language**: TypeScript
- **i18n**: Paraglide.js (Norwegian + English)

## Next Steps for Implementation

1. Create migration for session tracking tables
2. Add session_id parameter to card performance recording
3. Create progress store for state management
4. Build chart components (line graph, bar chart, etc.)
5. Create progress dashboard page
6. Add API endpoints for statistics
7. Implement time period filters
8. Add historical trend analysis

## Performance Tips

- Use server-side aggregations for large datasets
- Cache expensive calculations
- Lazy-load chart libraries
- Paginate historical data
- Consider materialized views for complex queries

---

See `PROGRESS_TRACKING_ANALYSIS.md` for complete technical details.
