# Shuffle Mode Selector - User Guide

**Feature:** Users can now select which shuffle mode they want to use when practicing custom lists.

## Overview

The Shuffle Mode Selector appears at the top of custom list practice sessions, allowing users to:

1. **Toggle Smart Shuffle On/Off** - Enable or disable intelligent card weighting
2. **Choose a Shuffle Mode** - Select between three different shuffling algorithms:
   - 🎲 **Balansert (Balanced)** - Default mode with mix of all difficulty levels
   - 🧠 **Mestring fokusert (Mastery-Focused)** - Emphasizes well-known cards
   - ⚙️ **Utfordring først (Challenge-First)** - Focuses on difficult cards

## How It Works

### Smart Shuffle Toggle

When you enable "🔀 Smart stokking" (Smart Shuffle), the app uses intelligent weighting based on card mastery levels. When disabled, cards are shuffled randomly like before.

### Shuffle Modes (When Smart Shuffle is Enabled)

**Balansert (Balanced) - Default**

- Weight range: 1.0x - 1.8x
- Best for: Maintaining all skills while building confidence
- Distribution: 30% hard cards, 30% medium, 40% easy
- Use when: You want a balanced, engaging session

**Mestring fokusert (Mastery-Focused)**

- Weight range: 1.0x - 2.5x
- Best for: Confidence building and skill maintenance
- Distribution: More repetition of cards you already know
- Use when: You want to boost your confidence or maintain mastery

**Utfordring først (Challenge-First)**

- Weight range: 0.5x - 1.2x (inverted)
- Best for: Focused improvement on weak areas
- Distribution: More cards you find challenging
- Use when: You want to focus on learning difficult cards

## Visual Design

- **ShuffleSelector Component** displays below the header
- **Only shown for custom lists** - Built-in Hiragana/Katakana lists use regular shuffle
- **Toggle checkbox** - Enable/disable smart shuffle with visual feedback
- **Mode buttons** - Click to select mode, active mode highlighted in blue
- **Description text** - Shows what the current mode does
- **Responsive design** - Stacks nicely on mobile devices

## Technical Implementation

### Component Structure

```
ListPage.svelte (Practice page)
  ├── Header (with direction toggle)
  ├── ShuffleSelector ← NEW
  │   ├── Toggle checkbox (enableSmartShuffle)
  │   ├── Mode buttons (balanced, mastery-focused, challenge-first)
  │   └── Description text
  ├── FlashCard (card display)
  └── Navigation controls
```

### State Management

- `enableSmartShuffle`: boolean - Toggles smart shuffle on/off
- `shuffleMode`: ShuffleMode - Current selected mode
- When either changes, cards are automatically re-shuffled

### Smart Shuffle Integration

When smart shuffle is enabled:

1. Cards are passed to `performSmartShuffle()` function
2. Each card gets a weight based on mastery level and selected mode
3. Weighted cards are shuffled using Fisher-Yates algorithm
4. Up to 25 cards are returned for the session

When smart shuffle is disabled:

1. Cards are shuffled using simple random sort
2. Works for both custom lists and built-in lists
3. Behavior matches pre-Phase 2 implementation

### Built-In Lists

For Hiragana/Katakana built-in lists:

- ShuffleSelector is hidden (only appears for custom lists)
- Regular shuffle is always used
- Future Phase 4 work will convert these to custom list format

## User Journey

### Custom List Practice

1. User navigates to custom list practice page
2. ShuffleSelector appears at top
3. Smart Shuffle is ON by default (Balanced mode)
4. User can:
   - Change shuffle mode by clicking a button
   - Disable smart shuffle with checkbox
5. Cards reshuffle immediately based on selection
6. Practice continues with selected shuffle mode

### Example Scenario

**User Path:**

```
1. Opens "Japanese Foods" custom list
2. ShuffleSelector shows with "Smart stokking" enabled, "Balansert" selected
3. Sees mix of food-related cards (some easy, some hard)
4. Wants more challenge to learn new words
5. Clicks "Utfordring først" button
6. Cards immediately reshuffle with more difficult cards
7. Practices new vocabulary
8. Done - returns to custom list menu
```

## Performance Considerations

- Shuffle operations are lightweight (238 lines of optimized TypeScript)
- Re-shuffling happens instantly when mode changes
- No network calls or complex calculations
- Fisher-Yates algorithm is O(n) time complexity
- Suitable for lists with 100+ cards

## Accessibility

- ✅ Full keyboard navigation (tab between buttons)
- ✅ Semantic HTML (buttons, labels, checkboxes)
- ✅ Clear labels in Norwegian
- ✅ High contrast text and buttons
- ✅ Touch-friendly button sizes (mobile)
- ✅ Responsive design for all screen sizes

## Browser Support

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive on desktop, tablet, and mobile
- Touch and keyboard input supported

## Related Features

- **Phase 1**: Performance metrics that determine card mastery levels
- **Phase 2**: Smart Shuffle with this selector (YOU ARE HERE)
- **Phase 3**: Saving study sessions, scoring system, achievements
- **Phase 4**: Converting built-in lists to custom format for shuffle support

## Future Enhancements

Potential improvements for Phase 3+:

- Save user's preferred shuffle mode to localStorage
- Display statistics after session (which shuffle mode was most effective)
- Advanced filtering before shuffle (only review difficult cards)
- Time-based challenges with shuffle statistics
- Achievement badges for maintaining streaks in different modes
