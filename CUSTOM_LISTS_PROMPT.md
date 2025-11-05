# LLM Prompt: Implement Enhanced Custom Lists Functionality for Kana Flash Card Application

## Project Context

You are working on a SvelteKit + TypeScript flash card application for learning Japanese Kana (Hiragana and Katakana). The app currently has:

- **Framework**: SvelteKit with TypeScript
- **Current Features**:
  - Flash card display for Hiragana and Katakana characters
  - Basic custom list editor at `/custom` route
  - ListEditor component with add/remove/save/reset functionality
  - Storage utilities for managing custom lists in localStorage
- **UI Language**: Norwegian (Bokmål)
- **Styling**: Custom CSS with playful, modern design using color variables

## Current Implementation Status

### Existing Files & Components

1. **`src/routes/custom/+page.svelte`**: Type selection page (Hiragana/Katakana) that shows the ListEditor
2. **`src/lib/components/ListEditor.svelte`**: Modal editor for adding/removing flashcard pairs
3. **`src/lib/utils/storage.ts`**: localStorage utilities (needs implementation/verification)
4. **`src/lib/data/kana.ts`**: Data structure defining `KanaCharacter` interface:
   ```typescript
   interface KanaCharacter {
     character: string;
     romanization: string;
     type: "hiragana" | "katakana";
   }
   ```

### Known Issues & Gaps

1. **Storage implementation** may be incomplete or missing key functions
2. **Single list limitation**: Users can only have one custom list per type (Hiragana/Katakana)
3. **No list management**: Cannot create, name, or switch between multiple custom lists
4. **Limited flashcard model**: Only supports character ↔ romanization pairs (no meanings, audio, etc.)

## Requirements: Enhanced Custom Lists Feature

### User Stories

1. **As a user, I want to create multiple named custom lists** (e.g., "Common Words", "Food Vocabulary", "Daily Phrases") so I can organize different learning goals separately

2. **As a user, I want each flashcard to support front/back content** (not just character/romanization) so I can create cards like:

   - Front: "こんにちは" → Back: "konnichiwa (hello)"
   - Front: "cat" → Back: "ねこ (neko)"
   - Front: "ありがとう" → Back: "arigatou (thank you)"

3. **As a user, I want to practice any of my custom lists** just like I practice standard Hiragana/Katakana lists

4. **As a user, I want to manage my lists** (rename, delete, duplicate, export/import) to keep my study materials organized

5. **As a user, I want flashcards to optionally include additional information** like word meanings, example sentences, or pronunciation notes

6. **As a user, I want to easily switch between showing front→back and back→front** so I can test myself in both directions (e.g., Japanese→English or English→Japanese for vocabulary practice)

7. **As a user, I want to share my custom lists with others via a shareable link or code** so I can easily distribute vocabulary lists to study groups, students, or friends without requiring file transfers

### Technical Requirements

#### 1. Data Structure Enhancements

Extend the data model to support:

```typescript
interface CustomFlashCard {
  id: string; // Unique identifier
  front: string; // Front side content
  back: string; // Back side content
  type: "hiragana" | "katakana" | "mixed" | "custom";
  meaning?: string; // Optional meaning/translation
  notes?: string; // Optional study notes
  tags?: string[]; // Optional tags for filtering
  createdAt: Date;
  lastReviewed?: Date;
}

interface CustomList {
  id: string; // Unique identifier
  name: string; // User-defined list name
  type: "hiragana" | "katakana" | "mixed" | "custom";
  cards: CustomFlashCard[];
  createdAt: Date;
  updatedAt: Date;
  defaultDirection?: "front-to-back" | "back-to-front"; // Default practice direction
}
```

#### 2. Storage Layer

Implement complete localStorage utilities in `src/lib/utils/storage.ts`:

- `getAllCustomLists(): CustomList[]` - Retrieve all lists
- `getCustomList(id: string): CustomList | null` - Get specific list
- `saveCustomList(list: CustomList): void` - Save/update list
- `deleteCustomList(id: string): void` - Delete list
- `duplicateCustomList(id: string, newName: string): CustomList` - Clone list
- `exportList(id: string): string` - Export as JSON
- `importList(jsonString: string): CustomList` - Import from JSON
- `generateShareToken(id: string): string` - Generate JWT token containing list data
- `importFromShareToken(token: string): CustomList` - Decode JWT and import list

**JWT Sharing Implementation:**
- Use a lightweight JWT library (e.g., `jose` or `jsonwebtoken`) for encoding/decoding
- JWT payload should contain: list data, creation timestamp, optional expiry
- No server required - JWT is self-contained and can be shared as a string
- Validate JWT structure and decode safely with error handling
- Allow users to copy token to clipboard or generate a shareable URL parameter

Consider migration strategy if old data format exists.

#### 3. UI Components

Create/update the following components:

##### a) **List Management Page** (`src/routes/custom/+page.svelte`)

Replace type selection with list management dashboard:

- Display all custom lists as cards with preview info (name, card count, last updated)
- "Create New List" button
- Search/filter lists by name or type
- Quick actions per list: Edit, Practice, Duplicate, Delete, Export, **Share**
- Show "Import from Share Link" button prominently

##### b) **List Creation/Edit Modal** (`src/lib/components/ListEditor.svelte` or update existing)

Enhanced editor features:

- **List settings**: Name, type (hiragana/katakana/mixed/custom)
- **Card editor**: Front/back text inputs, optional meaning field, optional notes
- **Bulk import**: Paste tab-separated or CSV data (front\tback\tmeaning)
- **Validation**: Ensure no empty cards, unique IDs
- **Actions**: Save, Cancel, Delete List
- **Character count indicator** for list

##### c) **Custom Practice Mode** (`src/routes/custom/[listId]/+page.svelte`)

New dynamic route for practicing custom lists:

- Load list by ID from URL parameter
- Use existing `FlashCard` component but adapt for front/back content
- **Direction toggle button**: Allow users to switch between front→back and back→front during practice
- Show optional meaning/notes below card when revealed
- Same navigation as standard modes (next, previous, shuffle)
- Link back to custom lists dashboard
- Persist direction preference in session or localStorage

##### d) **Bulk Import Dialog** (`src/lib/components/BulkImportDialog.svelte`)

Optional standalone component:

- Textarea for pasting tabulated data
- Format guide/examples
- Preview parsed cards before adding
- Error handling for malformed input

##### e) **Share Dialog** (`src/lib/components/ShareDialog.svelte`)

New component for sharing lists:

- "Copy to Clipboard" button with success feedback
- Generate shareable URL with token as query parameter (e.g., `/custom/import?token=...`)
- Visual indication when token is copied

##### f) **Import from Share Dialog** (`src/lib/components/ImportShareDialog.svelte`)

New component for importing shared lists:

- Automatic detection if URL contains token parameter
- Preview list details before importing (name, card count, type)
- Option to rename list before importing to avoid conflicts
- Error handling for invalid/expired tokens
- Success message after import

#### 4. Routes Structure

```
src/routes/
├── custom/
│   ├── +page.svelte              # List management dashboard
│   ├── +page.ts                  # Load all lists, handle import token from URL
│   ├── import/
│   │   └── +page.svelte          # Dedicated import page (optional)
│   ├── [listId]/
│   │   ├── +page.svelte          # Practice specific list
│   │   ├── +page.ts              # Load list by ID
│   │   └── edit/
│   │       └── +page.svelte      # Edit specific list (optional separate route)
```

#### 5. Enhanced FlashCard Component

Update `src/lib/components/FlashCard.svelte` to handle:

- Generic `front` and `back` props (not just character/romanization)
- Optional `meaning` and `notes` display on back side
- Flexible font sizing based on content length
- Support for multi-line content

#### 6. Norwegian UI Text

All new UI elements must use Norwegian:

- "Egendefinerte lister" (Custom lists)
- "Opprett ny liste" (Create new list)
- "Rediger liste" (Edit list)
- "Øv på liste" (Practice list)
- "Slett liste" (Delete list)
- "Dupliser" (Duplicate)
- "Eksporter" (Export)
- "Importer" (Import)
- "Forside" (Front)
- "Bakside" (Back)
- "Betydning" (Meaning)
- "Notater" (Notes)
- "Masseopplasting" (Bulk upload)
- "Lagre endringer" (Save changes)
- "Bytt retning" (Switch direction)
- "Forside → Bakside" (Front → Back)
- "Bakside → Forside" (Back → Front)
- "Del liste" (Share list)
- "Kopier delingslenke" (Copy share link)
- "Kopier kode" (Copy code)
- "Kopiert!" (Copied!)
- "Importer fra delingslenke" (Import from share link)
- "Lim inn delingskode" (Paste share code)
- "Ugyldig delingskode" (Invalid share code)
- "Liste importert" (List imported)
- "Forhåndsvisning" (Preview)

### Implementation Plan

#### Phase 1: Foundation (Complete these first)

1. **Define new data structures** in a new file `src/lib/types/customLists.ts`
2. **Implement complete storage layer** in `src/lib/utils/storage.ts` with all CRUD operations
3. **Install JWT library**: `npm install jose` (lightweight, modern JWT library for browser/Node.js)
4. **Implement JWT sharing functions** in `src/lib/utils/sharing.ts`:
   - `generateShareToken(list: CustomList): Promise<string>`
   - `decodeShareToken(token: string): Promise<CustomList>`
   - Error handling for malformed/expired tokens
5. **Add migration logic** to convert old single-list format to new multi-list format (if applicable)
6. **Test storage functions** thoroughly with browser DevTools

#### Phase 2: Core Features

1. **Update/create list management dashboard** at `/custom`
   - List all custom lists
   - Create new list button
   - Delete/duplicate actions
2. **Enhance ListEditor component**
   - Support for list naming
   - Front/back card editing
   - Optional meaning field
3. **Create practice route** at `/custom/[listId]`
   - Load and display cards from specific list
   - Reuse/adapt existing flash card logic
   - Add direction toggle UI (button or switch)
   - Swap front/back content based on selected direction

#### Phase 3: Enhanced Features

1. **Implement bulk import**
   - Parse tab-separated or CSV data
   - Validation and preview
2. **Add export/import functionality**
   - JSON export/import
   - Share lists between devices
3. **Add meaning/notes display**
   - Show on card back
   - Styling considerations for longer text
4. **Implement JWT sharing system**:
   - Create ShareDialog component
   - Create ImportShareDialog component
   - Generate shareable URLs with token parameter
   - Handle token parameter in +page.ts to auto-import
   - Clipboard API integration for copy functionality
   - Optional: QR code generation using a library like `qrcode`

#### Phase 4: Polish & Testing

1. **Responsive design** for all new components
2. **Keyboard shortcuts** in editor
3. **Error handling** for storage quota, invalid imports
4. **Loading states** and user feedback
5. **Accessibility** checks
6. **Cross-browser testing**

### Design Consistency

Maintain existing design patterns:

- **Color scheme**: Use CSS variables from existing styles (`--color-accent`, `--color-heading`, `--color-bg-primary`)
- **Border radius**: Rounded corners (20-50px) for buttons and cards
- **Shadows**: Consistent box-shadows for depth
- **Typography**: Use `var(--font-heading)` for headings
- **Transitions**: Smooth animations (0.3s ease typical)
- **Spacing**: Generous padding (2rem) and gaps (1-2rem)

### Testing Checklist

- [ ] Can create new custom list with name
- [ ] Can add multiple flashcards with front/back content
- [ ] Can edit existing cards in a list
- [ ] Can delete individual cards from list
- [ ] Can delete entire lists
- [ ] Can duplicate a list with new name
- [ ] Custom lists appear in dashboard
- [ ] Can practice custom list via dedicated route
- [ ] FlashCards display front/back correctly
- [ ] Can toggle between front→back and back→front directions during practice
- [ ] Direction preference persists within session
- [ ] Optional meaning/notes display properly
- [ ] Bulk import parses data correctly
- [ ] Export creates valid JSON
- [ ] Import restores list from JSON
- [ ] Can generate share token/link for a list
- [ ] Can import list from share token
- [ ] Share token contains all list data (cards, metadata)
- [ ] Invalid share tokens show appropriate error messages
- [ ] URL with token parameter automatically triggers import flow
- [ ] Imported lists can be renamed to avoid conflicts
- [ ] localStorage persists across page reloads
- [ ] Mobile responsive on all new pages
- [ ] Norwegian text displays throughout
- [ ] No console errors during normal use

### Success Criteria

1. User can create and manage multiple named custom lists
2. Each list can contain flashcards with front/back content plus optional metadata
3. Lists persist in localStorage across sessions
4. User can practice any custom list just like built-in Hiragana/Katakana modes
5. UI is intuitive, responsive, and fully in Norwegian
6. Code is well-typed with TypeScript interfaces
7. All existing functionality remains intact

### Additional Context

- **Browser storage limits**: Be aware of localStorage ~5-10MB limits; consider warnings if approaching limit
- **Future enhancements**: Design with extensibility in mind (e.g., future spaced repetition, audio, images)
- **Backwards compatibility**: Ensure existing users' data migrates smoothly if old format exists
- **Error boundaries**: Handle corrupted localStorage data gracefully
- **JWT Security**: Since this is client-side only with no authentication, JWTs are used purely for encoding/decoding data, not for security. The token is just a convenient way to serialize and share list data. No secret key is needed - use an empty string or public constant
- **Token size**: Be mindful that JWT tokens can get large with many flashcards. Consider compression or limiting the shareable format if needed
- **URL length limits**: Browsers have URL length limits (~2000 chars). For very large lists, consider showing just the token for manual copy/paste instead of a full URL

## Deliverables

1. Complete, working implementation of all Phase 1-3 features
2. Updated/new components with proper TypeScript types
3. Storage utilities with full CRUD operations
4. New routes for list management and practice
5. Migration logic for existing data (if applicable)
6. Brief code comments explaining complex logic
7. All UI text in Norwegian

## Questions to Resolve Before Starting

1. Should we keep backwards compatibility with the old single-list format, or can we do a hard reset?
2. Do you want export/import in Phase 1, or can it wait for Phase 3?
3. Should the bulk import support multiple formats (CSV, JSON, TSV) or just one?
4. Any preference for confirmation dialogs (native confirm() vs custom modal)?
5. Should lists be sortable/reorderable in the dashboard?
6. For JWT sharing: Should tokens have an expiry date, or be valid indefinitely?
7. Should we implement QR codes for sharing, or just text-based tokens?

---

**Start by examining the existing code thoroughly, then implement Phase 1 completely before moving to Phase 2. Test each phase before proceeding to ensure stability.**
