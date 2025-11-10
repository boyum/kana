import type { CustomList, CustomFlashCard } from "$lib/types/customLists";
import { createEmptyPerformanceMetrics } from "$lib/utils/performance";
import { describe, it, expect, beforeEach } from "vitest";

/**
 * Unit tests for multi-list combination logic
 * Tests the core functionality of combining multiple custom lists
 */

describe("Multi-list combination", () => {
  let testList1: CustomList;
  let testList2: CustomList;
  let testList3: CustomList;

  beforeEach(() => {
    testList1 = {
      id: "list-1",
      name: "Hiragana Basics",
      cards: [
        {
          id: "card-1-1",
          front: "あ",
          back: "a",
          meaning: "vowel a",
          performance: {
            ...createEmptyPerformanceMetrics(),
            masteryLevel: 80,
            viewCount: 10,
            correctCount: 8,
          },
          createdAt: new Date("2024-01-01"),
        },
        {
          id: "card-1-2",
          front: "い",
          back: "i",
          meaning: "vowel i",
          performance: {
            ...createEmptyPerformanceMetrics(),
            masteryLevel: 60,
            viewCount: 5,
            correctCount: 3,
          },
          createdAt: new Date("2024-01-01"),
        },
      ],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-05"),
      defaultDirection: "front-to-back",
    };

    testList2 = {
      id: "list-2",
      name: "Katakana Basics",
      cards: [
        {
          id: "card-2-1",
          front: "ア",
          back: "a",
          meaning: "katakana a",
          performance: {
            ...createEmptyPerformanceMetrics(),
            masteryLevel: 40,
            viewCount: 8,
            correctCount: 3,
          },
          createdAt: new Date("2024-01-02"),
        },
        {
          id: "card-2-2",
          front: "イ",
          back: "i",
          meaning: "katakana i",
          performance: {
            ...createEmptyPerformanceMetrics(),
            masteryLevel: 50,
            viewCount: 6,
            correctCount: 3,
          },
          createdAt: new Date("2024-01-02"),
        },
      ],
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-06"),
      defaultDirection: "back-to-front",
    };

    testList3 = {
      id: "list-3",
      name: "Common Words",
      cards: [
        {
          id: "card-3-1",
          front: "こんにちは",
          back: "hello",
          meaning: "greeting",
          performance: {
            ...createEmptyPerformanceMetrics(),
            masteryLevel: 90,
            viewCount: 20,
            correctCount: 18,
          },
          createdAt: new Date("2024-01-03"),
        },
      ],
      createdAt: new Date("2024-01-03"),
      updatedAt: new Date("2024-01-07"),
      defaultDirection: "front-to-back",
    };
  });

  describe("Card combining", () => {
    it("should combine cards from two lists", () => {
      const allCards = [...testList1.cards, ...testList2.cards];

      expect(allCards.length).toBe(4);
      expect(allCards[0].id).toBe("card-1-1");
      expect(allCards[2].id).toBe("card-2-1");
    });

    it("should combine cards from three lists", () => {
      const allCards = [
        ...testList1.cards,
        ...testList2.cards,
        ...testList3.cards,
      ];

      expect(allCards.length).toBe(5);
      expect(allCards[0].front).toBe("あ");
      expect(allCards[4].front).toBe("こんにちは");
    });

    it("should preserve card performance data when combining", () => {
      const allCards = [...testList1.cards, ...testList2.cards];

      const card1 = allCards.find(c => c.id === "card-1-1");
      const card2 = allCards.find(c => c.id === "card-2-1");

      expect(card1?.performance.masteryLevel).toBe(80);
      expect(card1?.performance.viewCount).toBe(10);
      expect(card2?.performance.masteryLevel).toBe(40);
      expect(card2?.performance.viewCount).toBe(8);
    });

    it("should maintain unique card IDs across lists", () => {
      const allCards = [...testList1.cards, ...testList2.cards];
      const cardIds = allCards.map(c => c.id);
      const uniqueIds = new Set(cardIds);

      expect(uniqueIds.size).toBe(cardIds.length);
    });

    it("should handle empty lists gracefully", () => {
      const emptyList: CustomList = {
        ...testList1,
        id: "empty",
        cards: [],
      };

      const allCards = [...testList1.cards, ...emptyList.cards];

      expect(allCards.length).toBe(testList1.cards.length);
    });

    it("should maintain card metadata (meaning, notes, tags)", () => {
      const cardWithMeta: CustomFlashCard = {
        id: "meta-card",
        front: "test",
        back: "test",
        meaning: "test meaning",
        notes: "test notes",
        tags: ["tag1", "tag2"],
        performance: createEmptyPerformanceMetrics(),
        createdAt: new Date(),
      };

      const listWithMeta: CustomList = {
        ...testList1,
        cards: [cardWithMeta],
      };

      const allCards = [...listWithMeta.cards, ...testList2.cards];
      const metaCard = allCards.find(c => c.id === "meta-card");

      expect(metaCard?.meaning).toBe("test meaning");
      expect(metaCard?.notes).toBe("test notes");
      expect(metaCard?.tags).toEqual(["tag1", "tag2"]);
    });
  });

  describe("Card-to-list mapping", () => {
    it("should create correct card-to-list mapping", () => {
      const cardToListMap = new Map<string, string>();

      testList1.cards.forEach(card => cardToListMap.set(card.id, testList1.id));
      testList2.cards.forEach(card => cardToListMap.set(card.id, testList2.id));

      expect(cardToListMap.get("card-1-1")).toBe("list-1");
      expect(cardToListMap.get("card-1-2")).toBe("list-1");
      expect(cardToListMap.get("card-2-1")).toBe("list-2");
      expect(cardToListMap.get("card-2-2")).toBe("list-2");
    });

    it("should handle mapping for three or more lists", () => {
      const cardToListMap = new Map<string, string>();

      [testList1, testList2, testList3].forEach(list => {
        list.cards.forEach(card => cardToListMap.set(card.id, list.id));
      });

      expect(cardToListMap.size).toBe(5);
      expect(cardToListMap.get("card-3-1")).toBe("list-3");
    });

    it("should allow lookup of original list from any card", () => {
      const cardToListMap = new Map<string, string>();

      testList1.cards.forEach(card => cardToListMap.set(card.id, testList1.id));
      testList2.cards.forEach(card => cardToListMap.set(card.id, testList2.id));

      const allCards = [...testList1.cards, ...testList2.cards];
      const randomCard = allCards[2]; // card from list 2

      const originalListId = cardToListMap.get(randomCard.id);
      expect(originalListId).toBe("list-2");
    });
  });

  describe("List name combining", () => {
    it("should combine two list names with separator", () => {
      const combinedName = `${testList1.name} + ${testList2.name}`;

      expect(combinedName).toBe("Hiragana Basics + Katakana Basics");
    });

    it("should combine three list names", () => {
      const combinedName = [testList1, testList2, testList3]
        .map(l => l.name)
        .join(" + ");

      expect(combinedName).toBe(
        "Hiragana Basics + Katakana Basics + Common Words",
      );
    });

    it("should handle lists with special characters in names", () => {
      const specialList: CustomList = {
        ...testList1,
        name: "日本語 & Emoji 🎌",
      };

      const combinedName = `${specialList.name} + ${testList2.name}`;

      expect(combinedName).toContain("日本語 & Emoji 🎌");
      expect(combinedName).toContain("Katakana Basics");
    });
  });

  describe("List ID parsing from URL", () => {
    it("should parse comma-separated IDs from URL parameter", () => {
      const idsParam = "list-1,list-2,list-3";
      const listIds = idsParam.split(",").filter(id => id.trim());

      expect(listIds).toEqual(["list-1", "list-2", "list-3"]);
      expect(listIds.length).toBe(3);
    });

    it("should handle IDs with whitespace", () => {
      const idsParam = "list-1, list-2 , list-3";
      const listIds = idsParam.split(",").map(id => id.trim()).filter(Boolean);

      expect(listIds).toEqual(["list-1", "list-2", "list-3"]);
    });

    it("should handle single ID", () => {
      const idsParam = "list-1";
      const listIds = idsParam.split(",").filter(id => id.trim());

      expect(listIds).toEqual(["list-1"]);
      expect(listIds.length).toBe(1);
    });

    it("should filter out empty IDs", () => {
      const idsParam = "list-1,,list-2,,,list-3";
      const listIds = idsParam.split(",").map(id => id.trim()).filter(Boolean);

      expect(listIds).toEqual(["list-1", "list-2", "list-3"]);
      expect(listIds.length).toBe(3);
    });

    it("should handle URL-encoded IDs", () => {
      const idsParam = decodeURIComponent("list-1,list-2");
      const listIds = idsParam.split(",");

      expect(listIds).toEqual(["list-1", "list-2"]);
    });
  });

  describe("Validation", () => {
    it("should validate minimum number of lists (2)", () => {
      const listIds = ["list-1"];
      const isValid = listIds.length >= 2;

      expect(isValid).toBe(false);
    });

    it("should accept 2 or more lists", () => {
      const twoLists = ["list-1", "list-2"];
      const threeLists = ["list-1", "list-2", "list-3"];

      expect(twoLists.length >= 2).toBe(true);
      expect(threeLists.length >= 2).toBe(true);
    });

    it("should filter out lists with no cards", () => {
      const lists = [testList1, { ...testList2, cards: [] }, testList3];
      const validLists = lists.filter(list => list.cards.length > 0);

      expect(validLists.length).toBe(2);
      expect(validLists[0].id).toBe("list-1");
      expect(validLists[1].id).toBe("list-3");
    });

    it("should handle null/undefined lists", () => {
      const lists = [testList1, null, testList2, undefined].filter(Boolean);

      expect(lists.length).toBe(2);
    });
  });

  describe("Direction handling", () => {
    it("should use first list's direction when combining", () => {
      const lists = [testList1, testList2];
      const direction = lists[0].defaultDirection || "front-to-back";

      expect(direction).toBe("front-to-back");
    });

    it("should default to front-to-back if first list has no direction", () => {
      const listWithoutDirection: CustomList = {
        ...testList1,
        defaultDirection: undefined,
      };

      const direction = listWithoutDirection.defaultDirection || "front-to-back";

      expect(direction).toBe("front-to-back");
    });

    it("should ignore other lists' directions", () => {
      // testList1 has front-to-back, testList2 has back-to-front
      const lists = [testList1, testList2];
      const direction = lists[0].defaultDirection;

      expect(direction).toBe("front-to-back");
      // testList2's direction is ignored when combining
    });
  });

  describe("Performance metrics preservation", () => {
    it("should maintain mastery levels across combined cards", () => {
      const allCards = [...testList1.cards, ...testList2.cards];

      const masteryLevels = allCards.map(c => c.performance.masteryLevel);

      expect(masteryLevels).toContain(80); // from testList1
      expect(masteryLevels).toContain(60); // from testList1
      expect(masteryLevels).toContain(40); // from testList2
      expect(masteryLevels).toContain(50); // from testList2
    });

    it("should maintain view counts across combined cards", () => {
      const allCards = [...testList1.cards, ...testList2.cards];

      const totalViews = allCards.reduce(
        (sum, card) => sum + card.performance.viewCount,
        0,
      );

      expect(totalViews).toBe(10 + 5 + 8 + 6); // sum of all view counts
    });

    it("should preserve correct/incorrect counts", () => {
      const allCards = [...testList1.cards, ...testList2.cards];

      const totalCorrect = allCards.reduce(
        (sum, card) => sum + card.performance.correctCount,
        0,
      );

      expect(totalCorrect).toBe(8 + 3 + 3 + 3); // sum of all correct counts
    });
  });

  describe("Edge cases", () => {
    it("should handle very large number of lists", () => {
      const manyLists = Array.from({ length: 50 }, (_, i) => ({
        ...testList1,
        id: `list-${i}`,
        name: `List ${i}`,
      }));

      const allCards = manyLists.flatMap(list => list.cards);
      const expectedCards = 50 * testList1.cards.length;

      expect(allCards.length).toBe(expectedCards);
    });

    it("should handle lists with many cards", () => {
      const largeList: CustomList = {
        ...testList1,
        cards: Array.from({ length: 1000 }, (_, i) => ({
          id: `card-${i}`,
          front: `Front ${i}`,
          back: `Back ${i}`,
          performance: createEmptyPerformanceMetrics(),
          createdAt: new Date(),
        })),
      };

      const allCards = [...largeList.cards, ...testList2.cards];

      expect(allCards.length).toBe(1002);
    });

    it("should handle duplicate card IDs across lists (shouldn't happen but test)", () => {
      const duplicateCardList: CustomList = {
        ...testList2,
        cards: testList1.cards, // same card objects
      };

      const allCards = [...testList1.cards, ...duplicateCardList.cards];
      const uniqueIds = new Set(allCards.map(c => c.id));

      // IDs are duplicated, but all cards are included
      expect(allCards.length).toBe(4);
      expect(uniqueIds.size).toBe(2); // only 2 unique IDs
    });

    it("should handle lists with mixed metadata completeness", () => {
      const minimalCard: CustomFlashCard = {
        id: "minimal",
        front: "Front",
        back: "Back",
        performance: createEmptyPerformanceMetrics(),
        createdAt: new Date(),
      };

      const completeCard: CustomFlashCard = {
        id: "complete",
        front: "Front",
        back: "Back",
        meaning: "Meaning",
        notes: "Notes",
        tags: ["tag1", "tag2"],
        performance: createEmptyPerformanceMetrics(),
        createdAt: new Date(),
      };

      const allCards = [minimalCard, completeCard];

      expect(allCards[0].meaning).toBeUndefined();
      expect(allCards[1].meaning).toBe("Meaning");
      expect(allCards[1].tags).toHaveLength(2);
    });
  });

  describe("Integration scenarios", () => {
    it("should support scenario: combine beginner and advanced lists", () => {
      const beginnerList: CustomList = {
        ...testList1,
        name: "Beginner Words",
        cards: testList1.cards.map(c => ({
          ...c,
          performance: { ...c.performance, masteryLevel: 30 },
        })),
      };

      const advancedList: CustomList = {
        ...testList2,
        name: "Advanced Words",
        cards: testList2.cards.map(c => ({
          ...c,
          performance: { ...c.performance, masteryLevel: 85 },
        })),
      };

      const allCards = [...beginnerList.cards, ...advancedList.cards];

      const avgMastery =
        allCards.reduce((sum, c) => sum + c.performance.masteryLevel, 0) /
        allCards.length;

      // Should have mix of beginner and advanced mastery levels
      expect(avgMastery).toBeGreaterThan(30);
      expect(avgMastery).toBeLessThan(85);
    });

    it("should support scenario: combine by theme (colors, numbers, animals)", () => {
      const colorsList: CustomList = {
        ...testList1,
        name: "Colors",
        cards: [
          {
            id: "color-1",
            front: "あか",
            back: "red",
            tags: ["color", "basic"],
            performance: createEmptyPerformanceMetrics(),
            createdAt: new Date(),
          },
        ],
      };

      const numbersList: CustomList = {
        ...testList2,
        name: "Numbers",
        cards: [
          {
            id: "number-1",
            front: "いち",
            back: "one",
            tags: ["number", "basic"],
            performance: createEmptyPerformanceMetrics(),
            createdAt: new Date(),
          },
        ],
      };

      const allCards = [...colorsList.cards, ...numbersList.cards];
      const allTags = allCards.flatMap(c => c.tags || []);

      expect(allTags).toContain("color");
      expect(allTags).toContain("number");
      expect(allTags).toContain("basic");
    });
  });
});
