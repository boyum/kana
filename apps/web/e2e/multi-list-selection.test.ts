import { expect, test, type Page } from "@playwright/test";

/**
 * E2E tests for multi-list selection and combined practice feature
 */

// Helper function to create test lists in localStorage
async function createTestLists(page: Page) {
  await page.evaluate(() => {
    const lists = [
      {
        id: "test-list-1",
        name: "Hiragana Basics",
        cards: [
          {
            id: "card-1-1",
            front: "あ",
            back: "a",
            meaning: "vowel a",
            createdAt: new Date().toISOString(),
            performance: {
              viewCount: 0,
              flipCount: 0,
              correctCount: 0,
              incorrectCount: 0,
              totalResponseTimeMs: 0,
              masteryLevel: 0,
            },
          },
          {
            id: "card-1-2",
            front: "い",
            back: "i",
            meaning: "vowel i",
            createdAt: new Date().toISOString(),
            performance: {
              viewCount: 0,
              flipCount: 0,
              correctCount: 0,
              incorrectCount: 0,
              totalResponseTimeMs: 0,
              masteryLevel: 0,
            },
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        defaultDirection: "front-to-back",
      },
      {
        id: "test-list-2",
        name: "Katakana Basics",
        cards: [
          {
            id: "card-2-1",
            front: "ア",
            back: "a",
            meaning: "katakana a",
            createdAt: new Date().toISOString(),
            performance: {
              viewCount: 0,
              flipCount: 0,
              correctCount: 0,
              incorrectCount: 0,
              totalResponseTimeMs: 0,
              masteryLevel: 0,
            },
          },
          {
            id: "card-2-2",
            front: "イ",
            back: "i",
            meaning: "katakana i",
            createdAt: new Date().toISOString(),
            performance: {
              viewCount: 0,
              flipCount: 0,
              correctCount: 0,
              incorrectCount: 0,
              totalResponseTimeMs: 0,
              masteryLevel: 0,
            },
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        defaultDirection: "front-to-back",
      },
      {
        id: "test-list-3",
        name: "Common Words",
        cards: [
          {
            id: "card-3-1",
            front: "こんにちは",
            back: "hello",
            meaning: "greeting",
            createdAt: new Date().toISOString(),
            performance: {
              viewCount: 0,
              flipCount: 0,
              correctCount: 0,
              incorrectCount: 0,
              totalResponseTimeMs: 0,
              masteryLevel: 0,
            },
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        defaultDirection: "front-to-back",
      },
    ];

    localStorage.setItem("kana_custom_lists", JSON.stringify(lists));
  });
}

test.describe("Multi-list selection UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/egendefinert");
    await createTestLists(page);
    await page.reload();
  });

  test("should show multi-select button when 2+ lists exist", async ({
    page,
  }) => {
    const multiSelectBtn = page.locator('button:has-text("Velg flere")');
    await expect(multiSelectBtn).toBeVisible();
  });

  test("should not show multi-select button with less than 2 lists", async ({
    page,
  }) => {
    // Clear lists and add only one
    await page.evaluate(() => {
      const lists = [
        {
          id: "single-list",
          name: "Single List",
          cards: [
            {
              id: "card-1",
              front: "Test",
              back: "Test",
              createdAt: new Date().toISOString(),
              performance: {
                viewCount: 0,
                flipCount: 0,
                correctCount: 0,
                incorrectCount: 0,
                totalResponseTimeMs: 0,
                masteryLevel: 0,
              },
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem("kana_custom_lists", JSON.stringify(lists));
    });

    await page.reload();

    const multiSelectBtn = page.locator('button:has-text("Velg flere")');
    await expect(multiSelectBtn).not.toBeVisible();
  });

  test("should enable multi-select mode when button is clicked", async ({
    page,
  }) => {
    await page.click('button:has-text("Velg flere")');

    // Button text should change to "Avbryt"
    const cancelBtn = page.locator('button:has-text("Avbryt")');
    await expect(cancelBtn).toBeVisible();

    // Checkboxes should appear on list cards
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes).toHaveCount(3); // One per list
  });

  test("should show checkboxes on list cards in multi-select mode", async ({
    page,
  }) => {
    await page.click('button:has-text("Velg flere")');

    // All three lists should have checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes).toHaveCount(3);
  });

  test("should hide practice and share buttons in multi-select mode", async ({
    page,
  }) => {
    // Initially buttons should be visible
    const practiceButtons = page.locator('button:has-text("Øv")');
    await expect(practiceButtons.first()).toBeVisible();

    // Enable multi-select mode
    await page.click('button:has-text("Velg flere")');

    // Practice buttons should be hidden
    await expect(practiceButtons.first()).not.toBeVisible();
  });

  test("should exit multi-select mode when cancel is clicked", async ({
    page,
  }) => {
    await page.click('button:has-text("Velg flere")');
    await page.click('button:has-text("Avbryt")');

    // Button should return to "Velg flere"
    const multiSelectBtn = page.locator('button:has-text("Velg flere")');
    await expect(multiSelectBtn).toBeVisible();

    // Checkboxes should be hidden
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes).not.toBeVisible();
  });
});

test.describe("List selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/egendefinert");
    await createTestLists(page);
    await page.reload();
    await page.click('button:has-text("Velg flere")');
  });

  test("should select a list when checkbox is clicked", async ({ page }) => {
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.check();

    await expect(firstCheckbox).toBeChecked();
  });

  test("should deselect a list when checkbox is clicked again", async ({
    page,
  }) => {
    const firstCheckbox = page.locator('input[type="checkbox"]').first();

    await firstCheckbox.check();
    await expect(firstCheckbox).toBeChecked();

    await firstCheckbox.uncheck();
    await expect(firstCheckbox).not.toBeChecked();
  });

  test("should allow selecting multiple lists", async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');

    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    await expect(checkboxes.nth(0)).toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
  });

  test("should highlight selected list cards", async ({ page }) => {
    const firstCard = page.locator(".list-card").first();
    const firstCheckbox = firstCard.locator('input[type="checkbox"]');

    await firstCheckbox.check();

    // Card should have selected class
    await expect(firstCard).toHaveClass(/selected/);
  });

  test("should show floating action bar when 2+ lists are selected", async ({
    page,
  }) => {
    const checkboxes = page.locator('input[type="checkbox"]');

    await checkboxes.nth(0).check();
    // Action bar should not appear yet with only 1 selected
    let actionBar = page.locator(".multi-select-actions");
    await expect(actionBar).not.toBeVisible();

    await checkboxes.nth(1).check();
    // Now it should appear
    actionBar = page.locator(".multi-select-actions");
    await expect(actionBar).toBeVisible();
  });

  test("should display correct selected count in action bar", async ({
    page,
  }) => {
    const checkboxes = page.locator('input[type="checkbox"]');

    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    const selectedCount = page.locator(".selected-count");
    await expect(selectedCount).toHaveText("2 lister valgt");

    await checkboxes.nth(2).check();
    await expect(selectedCount).toHaveText("3 lister valgt");
  });

  test("should hide action bar when less than 2 lists are selected", async ({
    page,
  }) => {
    const checkboxes = page.locator('input[type="checkbox"]');

    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    let actionBar = page.locator(".multi-select-actions");
    await expect(actionBar).toBeVisible();

    // Uncheck one
    await checkboxes.nth(1).uncheck();
    await expect(actionBar).not.toBeVisible();
  });
});

test.describe("Combined practice navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/egendefinert");
    await createTestLists(page);
    await page.reload();
    await page.click('button:has-text("Velg flere")');
  });

  test("should navigate to combined practice page when practice button is clicked", async ({
    page,
  }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    await page.click('button:has-text("Øv valgte lister")');

    // Should navigate to combined route
    await expect(page).toHaveURL(/\/egendefinert\/combined\?ids=/);
  });

  test("should include all selected list IDs in URL", async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();

    await page.click('button:has-text("Øv valgte lister")');

    const url = page.url();
    expect(url).toContain("ids=");
    expect(url).toContain("test-list-1");
    expect(url).toContain("test-list-2");
    expect(url).toContain("test-list-3");
  });

  test("should display combined title on practice page", async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    await page.click('button:has-text("Øv valgte lister")');

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Title should contain both list names
    const title = page.locator("h1, title");
    await expect(title.first()).toContainText("Hiragana Basics");
    await expect(title.first()).toContainText("Katakana Basics");
  });
});

test.describe("Combined practice functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/egendefinert");
    await createTestLists(page);
    await page.reload();
  });

  test("should display cards from all selected lists", async ({ page }) => {
    // Navigate directly to combined practice page
    await page.goto(
      "/egendefinert/combined?ids=test-list-1,test-list-2",
    );
    await page.waitForLoadState("networkidle");

    // Should have progress indicator showing combined card count
    const progress = page.locator(".progress");
    await expect(progress).toBeVisible();

    // Total cards: 2 from list 1 + 2 from list 2 = 4
    await expect(progress).toContainText("/ 4");
  });

  test("should show cards from first selected list", async ({ page }) => {
    await page.goto("/egendefinert/combined?ids=test-list-1,test-list-2");
    await page.waitForLoadState("networkidle");

    // Should display at least one card
    const flashCard = page.locator(".flash-card, [class*='card']");
    await expect(flashCard.first()).toBeVisible();
  });

  test("should allow navigation through combined cards", async ({ page }) => {
    await page.goto("/egendefinert/combined?ids=test-list-1,test-list-2");
    await page.waitForLoadState("networkidle");

    const nextBtn = page.locator('button:has-text("Neste")');
    await expect(nextBtn).toBeVisible();

    // Click next to go through cards
    await nextBtn.click();
    await nextBtn.click();

    // Progress should update
    const progress = page.locator(".progress");
    await expect(progress).toContainText("3 / 4");
  });

  test("should handle back button to return to lists page", async ({
    page,
  }) => {
    await page.goto("/egendefinert/combined?ids=test-list-1,test-list-2");
    await page.waitForLoadState("networkidle");

    const backBtn = page.locator('text="← Tilbake"');
    await backBtn.click();

    await expect(page).toHaveURL(/\/egendefinert$/);
  });
});

test.describe("Edge cases and error handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/egendefinert");
    await createTestLists(page);
    await page.reload();
  });

  test("should redirect to lists page when no IDs provided", async ({
    page,
  }) => {
    await page.goto("/egendefinert/combined");

    // Should redirect back
    await page.waitForURL(/\/egendefinert$/);
  });

  test("should redirect when only 1 list ID is provided", async ({ page }) => {
    await page.goto("/egendefinert/combined?ids=test-list-1");

    // Should redirect back (minimum 2 lists required)
    await page.waitForURL(/\/egendefinert$/);
  });

  test("should filter out invalid list IDs", async ({ page }) => {
    await page.goto(
      "/egendefinert/combined?ids=test-list-1,invalid-id,test-list-2",
    );
    await page.waitForLoadState("networkidle");

    // Should still work with valid lists only
    const progress = page.locator(".progress");
    await expect(progress).toContainText("/ 4"); // 2 valid lists with 2 cards each
  });

  test("should handle empty lists gracefully", async ({ page }) => {
    // Add an empty list
    await page.evaluate(() => {
      const lists = JSON.parse(
        localStorage.getItem("kana_custom_lists") || "[]",
      );
      lists.push({
        id: "empty-list",
        name: "Empty List",
        cards: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      localStorage.setItem("kana_custom_lists", JSON.stringify(lists));
    });

    await page.goto(
      "/egendefinert/combined?ids=test-list-1,empty-list,test-list-2",
    );
    await page.waitForLoadState("networkidle");

    // Should work with non-empty lists only
    const progress = page.locator(".progress");
    await expect(progress).toContainText("/ 4");
  });
});

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/egendefinert");
    await createTestLists(page);
    await page.reload();
  });

  test("should have accessible labels for checkboxes", async ({ page }) => {
    await page.click('button:has-text("Velg flere")');

    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    const label = await firstCheckbox.getAttribute("aria-label");

    expect(label).toBeTruthy();
    expect(label).toContain("Velg");
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.click('button:has-text("Velg flere")');

    // Tab to first checkbox
    await page.keyboard.press("Tab");
    const firstCheckbox = page.locator('input[type="checkbox"]').first();

    // Check via keyboard
    await page.keyboard.press("Space");
    await expect(firstCheckbox).toBeChecked();
  });

  test("should have visible focus indicators", async ({ page }) => {
    await page.click('button:has-text("Velg flere")');

    const multiSelectBtn = page.locator('button:has-text("Avbryt")');
    await multiSelectBtn.focus();

    // Button should have focus (visual test would be better but this checks it's focusable)
    await expect(multiSelectBtn).toBeFocused();
  });
});

test.describe("Mobile responsiveness", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/egendefinert");
    await createTestLists(page);
    await page.reload();
  });

  test("should display multi-select button on mobile", async ({ page }) => {
    const multiSelectBtn = page.locator('button:has-text("Velg flere")');
    await expect(multiSelectBtn).toBeVisible();
  });

  test("should show floating action bar on mobile", async ({ page }) => {
    await page.click('button:has-text("Velg flere")');

    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    const actionBar = page.locator(".multi-select-actions");
    await expect(actionBar).toBeVisible();
  });

  test("should have touch-friendly checkboxes", async ({ page }) => {
    await page.click('button:has-text("Velg flere")');

    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    const boundingBox = await firstCheckbox.boundingBox();

    // Checkbox should be at least 24x24px (minimum touch target)
    expect(boundingBox?.width).toBeGreaterThanOrEqual(24);
    expect(boundingBox?.height).toBeGreaterThanOrEqual(24);
  });
});
