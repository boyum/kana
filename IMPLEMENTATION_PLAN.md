# Kana Flash Card Application - Implementation Plan

## Project Overview

This is a simple web application built with SvelteKit and TypeScript that helps users learn Japanese Hiragana and Katakana characters through interactive flash cards.

## Current State

- ✅ SvelteKit project initialized with TypeScript
- ✅ Front page created with mode selection buttons (Hiragana/Katakana)
- ✅ Route structure created for `/hiragana` and `/katakana`
- ⏳ Flash card functionality needs implementation

## User Requirements

1. **Front Page**: Display two buttons for mode selection (Hiragana and Katakana)
2. **Flash Cards**: Each mode should display flash cards with animations
3. **Interaction**: Users can click cards to show the next character
4. **Top Menu**: Navigation buttons and information display

## Implementation Steps

### Step 1: Create Kana Data Structure

**Files to create**: `src/lib/data/kana.ts`

Create a TypeScript file containing all Hiragana and Katakana characters with their romanizations.

```typescript
export interface KanaCharacter {
  character: string;
  romanization: string;
  type: "hiragana" | "katakana";
}

// Include all basic characters:
// Hiragana: あ, い, う, え, お, か, き, く, け, こ, etc.
// Katakana: ア, イ, ウ, エ, オ, カ, キ, ク, ケ, コ, etc.
```

**Character sets to include**:

- Basic vowels (a, i, u, e, o)
- K-series (ka, ki, ku, ke, ko)
- S-series (sa, shi, su, se, so)
- T-series (ta, chi, tsu, te, to)
- N-series (na, ni, nu, ne, no)
- H-series (ha, hi, fu, he, ho)
- M-series (ma, mi, mu, me, mo)
- Y-series (ya, yu, yo)
- R-series (ra, ri, ru, re, ro)
- W-series (wa, wo)
- N (ん/ン)

### Step 2: Create Flash Card Component

**Files to create**: `src/lib/components/FlashCard.svelte`

Create a reusable Svelte component that displays a single flash card.

**Component features**:

- Display the Kana character on the front
- Display the romanization on the back
- Flip animation when clicked
- Props: `character`, `romanization`, `flipped` state
- Emit events for user interactions

**Styling requirements**:

- Card size: approximately 300x400px
- Center aligned content
- Large, readable font for characters (e.g., 6rem)
- Smooth flip animation (CSS transform with transition)
- Box shadow for depth effect
- Background color differentiating front and back

### Step 3: Implement Hiragana Mode Page

**Files to update**: `src/routes/hiragana/+page.svelte`

**Features to implement**:

1. Import Hiragana character data
2. State management:
   - Current card index
   - Show character or romanization (flipped state)
   - Shuffle option
3. Navigation controls:
   - "Next" button to advance to next card
   - "Previous" button to go back
   - "Shuffle" button to randomize order
   - Progress indicator (e.g., "5 / 46")
4. Card flip on click
5. Auto-advance option (optional)

**Layout**:

```
[Header with navigation menu]
[Flash Card Component]
[Navigation buttons: Previous | Next]
[Progress indicator]
```

### Step 4: Implement Katakana Mode Page

**Files to update**: `src/routes/katakana/+page.svelte`

Implement the same features as Hiragana mode, but using Katakana character data.
Consider creating a shared component or composable function to avoid code duplication.

### Step 5: Create Navigation Menu Component

**Files to create**: `src/lib/components/NavMenu.svelte`

Create a top navigation menu with:

- "Home" button (link to `/`)
- Current mode indicator
- "Info" button (could show a modal with instructions)
- Styling: Fixed position at top, full width, with proper spacing

### Step 6: Add Animations and Polish

**Enhancements**:

1. **Card flip animation**: Use CSS 3D transforms

   ```css
   transform: rotateY(180deg);
   transition: transform 0.6s;
   transform-style: preserve-3d;
   ```

2. **Slide transition** between cards (optional):
   - Use Svelte's built-in transitions
   - `import { fly, fade } from 'svelte/transition';`

3. **Keyboard navigation**:
   - Arrow keys for next/previous
   - Space bar to flip card
   - Implement using Svelte's `on:keydown` handlers

4. **Responsive design**:
   - Mobile-friendly card sizes
   - Touch-friendly button sizes
   - Media queries for different screen sizes

### Step 7: Add Settings/Options (Optional Enhancement)

**Files to create**: `src/lib/components/SettingsModal.svelte`

**Features**:

- Toggle between showing character first vs. romanization first
- Auto-advance timer setting
- Filter by character groups (vowels, K-series, etc.)
- Practice mode (randomized vs. sequential)

### Step 8: Testing and Refinement

1. Test all navigation flows
2. Verify all characters display correctly
3. Test on different browsers and devices
4. Check accessibility (keyboard navigation, screen readers)
5. Optimize performance

## Technical Considerations

### State Management

- Use Svelte's built-in reactive state (`$:` syntax)
- Consider using Svelte stores for shared state if needed
- Local storage for user preferences (optional)

### Code Organization

```
src/
├── lib/
│   ├── components/
│   │   ├── FlashCard.svelte
│   │   ├── NavMenu.svelte
│   │   └── SettingsModal.svelte (optional)
│   ├── data/
│   │   └── kana.ts
│   └── utils/
│       └── shuffle.ts
├── routes/
│   ├── +page.svelte (home)
│   ├── hiragana/
│   │   └── +page.svelte
│   └── katakana/
│       └── +page.svelte
```

### Styling Approach

- Use scoped styles in Svelte components
- Consider using CSS variables for theming
- Maintain consistent spacing and color scheme
- Norwegian language for UI text (as per user request)

## Norwegian Language UI Text

Use Norwegian for all user-facing text:

- "Velg modus" (Choose mode)
- "Neste" (Next)
- "Forrige" (Previous)
- "Stokk" (Shuffle)
- "Hjem" (Home)
- "Informasjon" (Information)

## Expected Final User Flow

1. User lands on home page (`/`)
2. User clicks "Hiragana" or "Katakana" button
3. User sees first flash card showing Kana character
4. User clicks card to reveal romanization
5. User clicks "Next" to see next character
6. User can navigate back and forth through all characters
7. User can return home or switch modes via navigation menu

## Success Criteria

- ✅ All Hiragana and Katakana characters are displayed correctly
- ✅ Smooth flip animation when clicking cards
- ✅ Navigation works properly (next, previous, home)
- ✅ Application is responsive on mobile and desktop
- ✅ Code is clean, well-organized, and type-safe (TypeScript)
- ✅ Norwegian language used throughout UI

## Future Enhancements (Out of Scope)

- Quiz mode with scoring
- Dakuten and handakuten characters (が, ぱ, etc.)
- Combination characters (きゃ, しゅ, etc.)
- User progress tracking
- Spaced repetition algorithm
- Audio pronunciation

## Design Specifications

### Color Scheme

- **Background**: `#E6E1C5` (warm beige)
- **Heading Text**: `#395C6B` (dark blue-teal)
- **Background Accent**: `#80A4ED` (soft blue)

### Typography

- **Headings**: Caveat Brush (Google Fonts) - playful, handwritten style
- **Body**: System fonts (Segoe UI, etc.)

### Visual Style

- **Overall Feel**: Blobs, chewy, and playful
- **Background**: Blob patterns using radial gradients
- **Buttons**: Rounded (border-radius: 50px) with blob-like appearance
- **Animations**: Smooth transitions with bounce/scale effects
- **Shadows**: Soft, playful shadows for depth

### Button Styling

- Background color: `#80A4ED` (accent color)
- Hover state: `#395C6B` (heading color)
- Border-radius: 50px (pill shape)
- Border: 4px solid with white transparency
- Box-shadow for depth effect
- Transform on hover for playful interaction

### Flash Card Styling Recommendations

- Use rounded corners (border-radius: 30px or more)
- Soft box shadows
- Smooth rotation animations
- Background colors should complement the main palette
- Consider using blob SVG shapes as decorative elements
