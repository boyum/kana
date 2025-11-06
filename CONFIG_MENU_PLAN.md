# Config Menu Plan

## 🎯 Overview

A modal-based configuration menu accessible from the homepage via a cog wheel icon in the top right corner. The menu will centralize user preferences and settings for the entire Kana flashcard app.

## 📍 Location & Access

- **Trigger**: Cog wheel icon (⚙️) in top-right corner of homepage (`/src/routes/+page.svelte`)
- **Presentation**: Modal overlay (can be reused across app if needed)
- **Persistence**: Settings stored in localStorage with key `kana_app_config`

---

## �� Visual Design

### Modal Structure

```
┌─────────────────────────────────────┐
│  ⚙️ Innstillinger               ✕  │
├─────────────────────────────────────┤
│                                     │
│  🎴 Smart Shuffle Innstillinger    │
│  ├─ [✓] Aktiver Smart Shuffle      │
│  ├─ Standard modus: [Balanced ▾]   │
│  └─ Maks kort: [25        ▾]       │
│                                     │
│  �� Retning                         │
│  └─ Standard: [Forside → Bakside▾] │
│                                     │
│  🌐 Språk / Language                │
│  └─ [Norsk (Bokmål)          ▾]    │
│                                     │
│  📊 Data                            │
│  ├─ [Eksporter data]                │
│  ├─ [Importer data]                 │
│  └─ [Nullstill all data]            │
│                                     │
│  ℹ️ Om appen                        │
│  └─ Versjon: 1.0.0                  │
│                                     │
└─────────────────────────────────────┘
```

---

## ⚙️ Settings Structure

### 1. Smart Shuffle Settings (for custom lists)

```typescript
{
  enableSmartShuffle: boolean; // Default: true
  defaultShuffleMode: ShuffleMode; // Default: "balanced"
  maxShuffleSize: number; // Default: 25, Options: [10, 25, 50, 100]
}
```

**Options:**

- **Enable Smart Shuffle**: Toggle to enable/disable intelligent card ordering
- **Default Shuffle Mode**:
  - `balanced` - Mix of new and review cards
  - `mastery-focused` - Prioritize cards needing practice
  - `challenge-first` - Start with difficult cards
- **Max Cards per Session**: Limit the number of cards in a study session

### 2. Default Direction

```typescript
{
  defaultDirection: "front-to-back" | "back-to-front"; // Default: "front-to-back"
}
```

**Options:**

- `front-to-back` - Show front of card first (e.g., Kanji → Romanization)
- `back-to-front` - Show back of card first (e.g., Romanization → Kanji)

### 3. Language / Locale

```typescript
{
  language: "en" | "nb"; // Default: "nb"
}
```

**Options:**

- `nb` - Norsk (Bokmål)
- `en` - English

### 4. Appearance (Optional - Future)

```typescript
{
  theme: "light" | "dark" | "auto"; // For future implementation
  reducedMotion: boolean; // Accessibility option
}
```

### 5. Data Management

- **Export all lists**: Download JSON file with all custom lists and performance data
- **Import lists**: Upload JSON file to restore or add lists
- **Reset all data**: Clear all custom lists and settings (with confirmation dialog)
- **View storage usage**: Display how much localStorage is being used

---

## 📁 File Structure

### New Files to Create

```
src/lib/stores/
  └── config.svelte.ts            # Global config store (Svelte 5 runes)

src/lib/utils/
  └── configStorage.ts            # Config persistence utilities

src/lib/components/
  ├── ConfigModal.svelte          # Main modal component
  └── ConfigSection.svelte        # Reusable section component (optional)
```

### Files to Modify

```
src/routes/
  └── +page.svelte                # Add cog wheel button in top-right

src/routes/
  └── +layout.svelte              # Mount ConfigModal globally (optional approach)

src/lib/components/
  └── ListPage.svelte             # Read default settings from config store
```

---

## 🔧 Implementation Details

### 1. Config Store (src/lib/stores/config.svelte.ts)

Complete implementation with Svelte 5 runes, localStorage persistence, and migration support.

### 2. ConfigModal Component

Full modal component with sections for all settings, proper accessibility, and mobile responsiveness.

### 3. Homepage Integration

Add fixed-position cog wheel button in top-right corner that opens the modal.

### 4. ListPage Integration

Read default values from config store instead of hardcoding them.

---

## 🎨 Styling Considerations

### Color Palette (from existing app.css)

- **Primary Background**: `--color-bg-primary` (#e6e1c5)
- **Heading Color**: `--color-heading` (#395c6b)
- **Accent Color**: `--color-accent` (#80a4ed)
- **Text Color**: `--color-text` (rgba(0, 0, 0, 0.7))

### Design Principles

- **Consistency**: Match existing button styles and animations
- **Playful**: Use emoji icons and friendly language
- **Accessible**: High contrast, keyboard navigation, ARIA labels
- **Responsive**: Mobile-first approach with touch-friendly targets

### Animation Guidelines

- **Modal entrance**: Fade in backdrop + slide up content
- **Modal exit**: Fade out backdrop + slide down content
- **Button hover**: translateY(-3px) scale(1.05)
- **Transitions**: 0.3s ease for consistency

---

## ♿ Accessibility Features

### Keyboard Navigation

- **ESC key**: Closes modal
- **Tab/Shift+Tab**: Navigate between controls
- **Enter/Space**: Activate buttons and toggles
- **Focus trap**: Keep focus within modal when open
- **Focus return**: Return focus to trigger button on close

### ARIA Attributes

```html
<div role="dialog" aria-modal="true" aria-labelledby="config-title">
  <h2 id="config-title">⚙️ Innstillinger</h2>
</div>
```

### Screen Reader Support

- Proper heading hierarchy (h2, h3)
- Descriptive labels for all form controls
- aria-label for icon-only buttons
- Status announcements for save/reset actions

### Visual Considerations

- Minimum touch target size: 44x44px (mobile)
- Color is not the only indicator (use icons + text)
- Sufficient contrast ratios (WCAG AA compliant)
- Focus indicators visible on all interactive elements

---

## 📱 Responsive Behavior

### Desktop (> 720px)

- Modal width: 600px max, centered
- Padding: 1.5rem
- Two-column layout for buttons (optional)
- Hover states visible

### Mobile (≤ 720px)

- Modal: 95vh max height, full width with margin
- Single column layout
- Larger touch targets (44px min)
- Full-width buttons in footer
- Scrollable content area

### Touch Devices

- No hover states (use active states)
- Larger tap targets
- Swipe to dismiss (optional future enhancement)

---

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure

- [ ] Create config store with basic settings
- [ ] Create ConfigModal component skeleton
- [ ] Add cog wheel button to homepage
- [ ] Implement open/close functionality

### Phase 2: Settings Sections

- [ ] Smart Shuffle settings section
- [ ] Default direction setting
- [ ] Language selector integration
- [ ] Wire up all form controls to local state

### Phase 3: Persistence & Integration

- [ ] Save/load config from localStorage
- [ ] Integrate config with ListPage
- [ ] Sync changes across components
- [ ] Handle migration for existing users

### Phase 4: Data Management

- [ ] Export data functionality
- [ ] Import data functionality
- [ ] Reset data with confirmation
- [ ] Storage usage display

### Phase 5: Polish & Testing

- [ ] Animations and transitions
- [ ] Accessibility testing (keyboard, screen reader)
- [ ] Mobile optimization and testing
- [ ] Cross-browser testing
- [ ] User testing feedback

---

## 🔄 Data Flow

```
┌─────────────┐
│   User      │
│  clicks ⚙️  │
└─────┬───────┘
      │
      ▼
┌─────────────────┐
│  Modal Opens    │
│  Load current   │
│  config to      │
│  local state    │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│  User Edits     │
│  Settings       │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│  User Clicks    │
│  "Lagre"        │
└─────┬───────────┘
      │
      ▼
┌─────────────────────┐
│  Config Store       │
│  Updates            │
│  → localStorage     │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│  All Components     │
│  Reactively Update  │
│  (via $derived)     │
└─────────────────────┘
```

---

## 🧪 Testing Checklist

### Functionality

- [ ] Config persists across page refreshes
- [ ] New users get default config
- [ ] Changes are reflected in ListPage immediately
- [ ] Reset button restores all defaults
- [ ] Invalid values are rejected/sanitized
- [ ] Modal closes on ESC key
- [ ] Modal closes on backdrop click
- [ ] Save button closes modal and persists
- [ ] Cancel button discards changes

### Accessibility

- [ ] Tab order is logical
- [ ] Focus trap works correctly
- [ ] Focus returns to trigger on close
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces modal opening
- [ ] Form labels properly associated
- [ ] ARIA attributes correct

### Responsive

- [ ] Layout works on mobile (320px width)
- [ ] Layout works on tablet (768px width)
- [ ] Layout works on desktop (1024px+ width)
- [ ] Touch targets are 44px minimum
- [ ] Content scrolls when overflowing
- [ ] No horizontal scroll

### Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## �� Future Enhancements

### Phase 6: Advanced Features (Future)

- [ ] Theme switching (light/dark mode)
- [ ] Custom color schemes
- [ ] Advanced study options
- [ ] Study statistics preferences
- [ ] Animation preferences
- [ ] Cloud sync integration
- [ ] Profile management
- [ ] Achievement settings

### Additional Data Management

- [ ] Backup scheduling
- [ ] Import from CSV/other formats
- [ ] Export to different formats (CSV, Anki)
- [ ] Data encryption options
- [ ] Selective export (specific lists)

### UX Improvements

- [ ] Toast notifications for actions
- [ ] Live preview of settings
- [ ] Search within settings
- [ ] Quick settings (floating action button)
- [ ] Settings categories with tabs
- [ ] Keyboard shortcut reference

---

## 💡 UX Best Practices

### Form Interaction

1. **Explicit Save**: Use "Save" button rather than auto-save to prevent confusion
2. **Cancel Confirmation**: If changes made, confirm before discarding
3. **Visual Feedback**: Show loading states and success messages
4. **Validation**: Inline validation with helpful error messages
5. **Defaults**: Show which settings differ from defaults

### Modal Behavior

1. **Focus Management**: Set focus to first interactive element on open
2. **Escape Hatch**: Always provide clear way to close (X, ESC, backdrop)
3. **Scroll Position**: Remember scroll position when closing
4. **Animations**: Smooth transitions that respect reduced motion preference
5. **Mobile**: Consider bottom sheet on mobile for easier thumb access

### Setting Organization

1. **Grouping**: Logical sections with clear headings
2. **Priority**: Most used settings at top
3. **Context**: Brief descriptions for complex settings
4. **Discoverability**: Don't hide important settings in submenus
5. **Preview**: Show what setting does when possible

---

## 🎯 Summary

This config menu implementation will:

✅ Provide centralized access to all app settings  
✅ Persist user preferences across sessions  
✅ Integrate seamlessly with existing components  
✅ Follow established design patterns and styling  
✅ Be fully accessible and mobile-responsive  
✅ Allow users to customize their study experience  
✅ Support future feature additions easily

The design emphasizes simplicity, accessibility, and consistency with the existing Kana app's playful and friendly aesthetic.
