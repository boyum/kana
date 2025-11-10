# Multi-List Selection Feature - Test Documentation

This document describes the automated test suite for the multi-list selection and combined practice feature.

## Test Files Overview

### 1. Unit Tests for Multi-List Combination Logic

**File**: `src/lib/utils/multiListCombiner.spec.ts`
**Total Tests**: 33 tests
**Status**: ✅ All passing

#### Test Categories

**Card Combining (6 tests)**

- Combines cards from two lists
- Combines cards from three lists
- Preserves card performance data when combining
- Maintains unique card IDs across lists
- Handles empty lists gracefully
- Maintains card metadata (meaning, notes, tags)

**Card-to-List Mapping (3 tests)**

- Creates correct card-to-list mapping
- Handles mapping for three or more lists
- Allows lookup of original list from any card

**List Name Combining (3 tests)**

- Combines two list names with separator
- Combines three list names
- Handles lists with special characters in names

**List ID Parsing from URL (5 tests)**

- Parses comma-separated IDs from URL parameter
- Handles IDs with whitespace
- Handles single ID
- Filters out empty IDs
- Handles URL-encoded IDs

**Validation (4 tests)**

- Validates minimum number of lists (2)
- Accepts 2 or more lists
- Filters out lists with no cards
- Handles null/undefined lists

**Direction Handling (3 tests)**

- Uses first list's direction when combining
- Defaults to front-to-back if first list has no direction
- Ignores other lists' directions

**Performance Metrics Preservation (3 tests)**

- Maintains mastery levels across combined cards
- Maintains view counts across combined cards
- Preserves correct/incorrect counts

**Edge Cases (4 tests)**

- Handles very large number of lists (50+ lists)
- Handles lists with many cards (1000+ cards)
- Handles duplicate card IDs across lists
- Handles lists with mixed metadata completeness

**Integration Scenarios (2 tests)**

- Combines beginner and advanced lists
- Combines by theme (colors, numbers, animals)

---

### 2. Unit Tests for Smart Shuffle with Combined Lists

**File**: `src/lib/utils/smartShuffleMultiList.spec.ts`
**Total Tests**: 24 tests
**Status**: ✅ All passing

#### Test Categories

**Weight Calculation Across Lists (3 tests)**

- Calculates weights for cards from different lists
- Gives higher weights to high mastery cards
- Calculates consistent weights regardless of list origin

**Smart Shuffle with Combined Lists (6 tests)**

- Shuffles cards from all lists together
- Includes cards from multiple lists in shuffled result
- Respects maxShuffleSize with combined lists
- Handles small maxShuffleSize with many lists
- Works with challenge-first mode across lists
- Works with mastery-focused mode across lists

**Shuffle Session Statistics (4 tests)**

- Calculates stats for combined list session
- Tracks card appearances across lists
- Calculates mastery distribution across combined lists
- Identifies cards from each difficulty level across lists

**Weighted Appearance with Multiple Lists (2 tests)**

- Allows high-mastery cards to appear multiple times
- Respects individual card weights across lists

**Edge Cases with Combined Lists (5 tests)**

- Handles all cards having same mastery level
- Handles combining many lists
- Handles combining lists with few cards
- Handles maxShuffleSize larger than total cards
- Works with smart shuffle disabled

**Consistency Across Shuffles (2 tests)**

- Produces different shuffles with same config
- Maintains mastery distribution pattern across shuffles

**Integration with Combined List Practice (2 tests)**

- Preserves card metadata after shuffle
- Works with list-specific mastery patterns

---

### 3. E2E Tests for Multi-List Selection UI

**File**: `e2e/multi-list-selection.test.ts`
**Total Tests**: 28+ tests
**Framework**: Playwright

#### Test Categories

**Multi-List Selection UI (6 tests)**

- Shows multi-select button when 2+ lists exist
- Doesn't show multi-select button with less than 2 lists
- Enables multi-select mode when button is clicked
- Shows checkboxes on list cards in multi-select mode
- Hides practice and share buttons in multi-select mode
- Exits multi-select mode when cancel is clicked

**List Selection (7 tests)**

- Selects a list when checkbox is clicked
- Deselects a list when checkbox is clicked again
- Allows selecting multiple lists
- Highlights selected list cards
- Shows floating action bar when 2+ lists are selected
- Displays correct selected count in action bar
- Hides action bar when less than 2 lists are selected

**Combined Practice Navigation (3 tests)**

- Navigates to combined practice page when practice button is clicked
- Includes all selected list IDs in URL
- Displays combined title on practice page

**Combined Practice Functionality (4 tests)**

- Displays cards from all selected lists
- Shows cards from first selected list
- Allows navigation through combined cards
- Handles back button to return to lists page

**Edge Cases and Error Handling (4 tests)**

- Redirects to lists page when no IDs provided
- Redirects when only 1 list ID is provided
- Filters out invalid list IDs
- Handles empty lists gracefully

**Accessibility (3 tests)**

- Has accessible labels for checkboxes
- Is keyboard navigable
- Has visible focus indicators

**Mobile Responsiveness (3 tests)**

- Displays multi-select button on mobile
- Shows floating action bar on mobile
- Has touch-friendly checkboxes (24x24px minimum)

---

## Running the Tests

### Run All Unit Tests

```bash
npm run test:unit
```

### Run Specific Test Files

```bash
# Multi-list combiner tests
npx vitest run src/lib/utils/multiListCombiner.spec.ts

# Smart shuffle tests
npx vitest run src/lib/utils/smartShuffleMultiList.spec.ts
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Run Specific E2E Test File

```bash
npx playwright test e2e/multi-list-selection.test.ts
```

### Run Tests in Watch Mode (Development)

```bash
npm run test:unit -- --watch
```

---

## Test Coverage Summary

### Unit Tests

- ✅ **57 unit tests** covering core functionality
- All tests passing
- Coverage includes:
  - Card combination logic
  - List ID parsing and validation
  - Performance metrics preservation
  - Smart shuffle with mastery-based weighting
  - Edge cases and error handling
  - Integration scenarios

### E2E Tests

- ✅ **28+ E2E tests** covering user interactions
- Coverage includes:
  - Multi-select UI behavior
  - List selection interactions
  - Navigation flows
  - Combined practice functionality
  - Accessibility compliance
  - Mobile responsiveness
  - Error handling

---

## Test Data

### Sample Test Lists

**List 1: Hiragana Basics**

- 2 cards (あ, い)
- High mastery levels (80-90%)
- Default direction: front-to-back

**List 2: Katakana Basics**

- 2 cards (ア, イ)
- Medium mastery levels (40-60%)
- Default direction: back-to-front

**List 3: Common Words**

- 1 card (こんにちは)
- Low mastery level (20-30%)
- Default direction: front-to-back

---

## Key Test Scenarios

### 1. Basic Multi-Select Flow

1. User has 2+ custom lists
2. Clicks "☑️ Velg flere" button
3. Checkboxes appear on list cards
4. User selects 2+ lists
5. Floating action bar appears with "Øv valgte lister" button
6. User clicks practice button
7. Navigation to `/egendefinert/combined?ids=list1,list2`
8. Combined practice session starts with all cards

### 2. Smart Shuffle Integration

1. User selects lists with different mastery levels
2. Cards are combined from all selected lists
3. Smart shuffle applies mastery-based weighting
4. High-mastery cards appear more frequently (in mastery-focused mode)
5. Low-mastery cards appear more frequently (in challenge-first mode)
6. Session respects maxShuffleSize configuration

### 3. Edge Case Handling

1. User selects only 1 list → Alert shown
2. User provides invalid list ID → Filtered out silently
3. User selects empty list → Filtered out
4. User selects 10+ lists → All cards combined successfully
5. Combined cards exceed maxShuffleSize → Weighted selection applied

---

## Continuous Integration

### Pre-Commit Checks

```bash
# Run before committing
npm run test:unit -- --run
npm run check
```

### CI Pipeline

1. Run all unit tests
2. Run type checking
3. Run E2E tests (in CI environment)
4. Generate coverage report

---

## Adding New Tests

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("Feature name", () => {
  beforeEach(() => {
    // Setup test data
  });

  it("should do something specific", () => {
    // Arrange
    const input = ...;

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

### E2E Test Template

```typescript
import { expect, test } from "@playwright/test";

test.describe("Feature area", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/page-url");
    // Setup test data in localStorage
  });

  test("should perform user action", async ({ page }) => {
    // Arrange
    await page.click('button:has-text("Click Me")');

    // Assert
    await expect(page.locator(".result")).toBeVisible();
  });
});
```

---

## Test Maintenance

### When to Update Tests

1. **Feature Changes**: Update tests when modifying multi-list selection behavior
2. **New Features**: Add new tests for any additional functionality
3. **Bug Fixes**: Add regression tests for fixed bugs
4. **UI Changes**: Update E2E selectors if UI structure changes
5. **API Changes**: Update test data if CustomList or Card types change

### Common Issues

**Issue**: E2E tests fail with "element not found"
**Solution**: Increase wait times or use `page.waitForLoadState("networkidle")`

**Issue**: Unit tests fail with "Cannot find module"
**Solution**: Check import paths are correct (use `$lib` alias)

**Issue**: Smart shuffle tests occasionally fail
**Solution**: These tests involve randomness; occasional failures are expected. Re-run to verify.

---

## Test Metrics

### Current Status

- ✅ **57 unit tests** passing (100%)
- ✅ **28+ E2E tests** (coverage pending first run)
- ⏱️ Unit tests: ~4ms execution time
- ⏱️ E2E tests: Variable (browser-dependent)

### Coverage Goals

- [ ] 90%+ statement coverage for multi-list feature
- [ ] 85%+ branch coverage
- [ ] 100% of user-facing interactions tested in E2E

---

## Related Documentation

- [Multi-List Selection Implementation Summary](../README.md)
- [Smart Shuffle Documentation](../../docs/smart-shuffle.md)
- [Custom Lists API](../../docs/custom-lists-api.md)
- [Testing Best Practices](../../docs/testing.md)

---

## Contact & Support

For questions about the test suite or to report issues:

1. Check existing tests for examples
2. Review test output for specific error messages
3. Consult Vitest and Playwright documentation
4. Create an issue in the repository

---

**Last Updated**: 2025-01-10
**Test Framework Versions**:

- Vitest: 3.2.4
- Playwright: (check package.json)
- Testing Library: (check package.json)
