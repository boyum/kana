# Import Lists Page - Implementation Plan

## Overview

Create a new page at `/importer` that displays example lists from `exampleLists.ts`. Users can browse and import these lists into their personal collection. Remove the automatic population of example lists for new users.

## Phase 1: Core Page Structure

### 1.1 Create Route Structure

- [x] Create new route folder: `src/routes/importer/`
- [x] Create page component: `src/routes/importer/+page.svelte`
- [x] Create page data loader: `src/routes/importer/+page.ts`

### 1.2 Update Navigation

- [x] Add "Importer lister" button to main page (`src/routes/+page.svelte`)
- [x] Add link/button to import page from custom lists page (`src/routes/egendefinert/+page.svelte`)
- [x] Position it alongside "Dine egne flash-kort" button

## Phase 2: Storage & Data Management

### 2.1 Remove Auto-Population of Example Lists

- [x] Remove `initializeExampleLists()` function from `src/lib/utils/storage.ts`
- [x] Remove `EXAMPLE_LISTS_KEY` constant and related localStorage checks
- [x] Remove auto-execution of `initializeExampleLists()` at module load
- [x] Keep `exampleLists` array in `src/lib/data/exampleLists.ts` for the import page

### 2.2 Create Import Functionality

- [x] Create new function `importExampleList(exampleList: CustomList): CustomList` in storage.ts
  - Generate new ID for the imported list
  - Reset all card IDs
  - Reset all performance metrics
  - Set createdAt/updatedAt to current time
  - Save to user's custom lists
- [x] Add function to check if a list is already imported (by name or content hash)

## Phase 3: UI Components

### 3.1 Import List Card Component

Create a reusable component to display importable lists:

- [x] Create `src/lib/components/ImportableList.svelte`
  - Display list name
  - Show card count
  - Show preview of first few cards (3-5 cards)
  - "Import" button
  - Visual indicator if already imported ("✓ Importert")

### 3.2 Import Page Layout

- [x] Header section with title and back button
- [x] Search/filter functionality
- [x] Grid layout for importable lists
- [x] Empty state (for when filters show no results)
- [x] Back navigation to custom lists page

## Phase 4: Import Logic

### 4.1 Import Process

- [x] Click "Import" button on a list card
- [x] Show confirmation dialog with list details
- [x] Import the list with all cards
- [x] Show success message/toast
- [x] Update UI to show list is now imported

### 4.2 Duplicate Prevention

- [x] Check if list with same name already exists
- [x] If duplicate, prompt user:
  - Option 1: Import as new list with modified name (e.g., "List Name (2)")
  - Option 2: Cancel import

## Phase 5: User Experience Enhancements

### 5.1 Visual Design

- [x] Use consistent styling with existing pages
- [x] Card-based layout for lists
- [x] Hover effects and animations
- [x] Responsive design for mobile/tablet
- [x] Loading states during import

### 5.2 Navigation Flow

- [x] After importing, offer navigation options:
  - Return to custom lists page via footer button
  - Continue browsing more lists

## Phase 6: Future-Proofing

### 6.1 Prepare for Community Lists

- [x] Design data structure to support:
  - Structure page to easily add filters and sorting

### 6.2 API Ready

- [x] Structure code to easily replace `exampleLists` with API call
- [x] Separate presentation logic from data fetching
- [x] Use `+page.ts` for data loading (SSR ready)

## File Structure

- src/routes/importer/+page.svelte # Main import page
- src/routes/importer/+page.ts # Data loader (returns exampleLists for now)
- src/lib/components/ImportableList.svelte # Card component for each importable list
- src/lib/utils/storage.ts # Added importExampleList() and listNameExists() functions
- src/lib/utils/storage.ts # Add importExampleList() function # Remove initializeExampleLists()
- src/lib/data/exampleLists.ts # Keep as-is (source of truth for examples)

## Implementation Order

1. **Start with storage changes** (Phase 2)
   - Remove auto-population
   - Add import function
2. **Create basic page** (Phase 1 & 3)
   - Route structure
   - Basic layout
   - ImportableList component
3. **Add import logic** (Phase 4)
   - Import functionality
   - Duplicate handling
4. **Polish UI/UX** (Phase 5)
   - Styling
   - Navigation flow
   - Success states
5. **Future-proof** (Phase 6)
   - Add metadata structure
   - Prepare for API integration

## Key Benefits

✅ Separates example lists from user's personal lists
✅ Users explicitly choose which lists to import
✅ Keeps storage clean (no unused example lists)
✅ Scalable for future community-contributed lists
✅ Easy to add more example lists without affecting existing users
✅ Clear distinction between "my lists" and "available lists"

## Migration Strategy

For existing users who already have example lists:

- No action needed - they keep their existing lists
- They can still import more from the import page
- No breaking changes to existing functionality
