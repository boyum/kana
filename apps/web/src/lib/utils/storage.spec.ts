/**
 * Tests for storage utilities
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateId,
  getAllCustomLists,
  getCustomList,
  saveCustomList,
  deleteCustomList,
  duplicateCustomList,
  exportList,
  importJsonAsList,
  addList,
  listNameExists,
} from "./storage";
import type { CustomList, CustomFlashCard } from "$lib/types/customLists";
import { createEmptyPerformanceMetrics } from "./performance";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace global localStorage and window with mock
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, "window", {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

// Helper to create a test card
function createTestCard(
  front: string,
  back: string,
): CustomFlashCard {
  return {
    id: generateId(),
    front,
    back,
    performance: createEmptyPerformanceMetrics(),
    createdAt: new Date(),
  };
}

// Helper to create a test list
function createTestList(name: string, cardCount: number = 3): CustomList {
  const cards: CustomFlashCard[] = [];
  for (let i = 0; i < cardCount; i++) {
    cards.push(createTestCard(`Front ${i + 1}`, `Back ${i + 1}`));
  }

  return {
    id: generateId(),
    name,
    cards,
    createdAt: new Date(),
    updatedAt: new Date(),
    defaultDirection: "front-to-back",
  };
}

describe("Storage utilities", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("Migration from old format", () => {
    it("should not migrate if new format already exists", () => {
      // Set up new format data
      const newList = createTestList("Existing List");
      saveCustomList(newList);

      // Set up old format data that should be ignored
      localStorage.setItem(
        "kana_custom_hiragana",
        JSON.stringify([
          { character: "あ", romanization: "a" },
          { character: "い", romanization: "i" },
        ]),
      );

      // Clear and re-trigger migration by re-importing
      const lists = getAllCustomLists();

      // Should only have the new format list
      expect(lists.length).toBe(1);
      expect(lists[0].name).toBe("Existing List");
    });
  });

  describe("generateId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it("should generate IDs with expected format (timestamp-random)", () => {
      const id = generateId();

      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });

    it("should generate IDs that are strings", () => {
      const id = generateId();

      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe("getAllCustomLists", () => {
    it("should return empty array when no lists exist", () => {
      const lists = getAllCustomLists();

      expect(lists).toEqual([]);
    });

    it("should return all saved lists", () => {
      const list1 = createTestList("List 1");
      const list2 = createTestList("List 2");

      saveCustomList(list1);
      saveCustomList(list2);

      const lists = getAllCustomLists();

      expect(lists.length).toBe(2);
      expect(lists[0].name).toBe("List 1");
      expect(lists[1].name).toBe("List 2");
    });

    it("should deserialize dates correctly", () => {
      const list = createTestList("Test List");
      saveCustomList(list);

      const lists = getAllCustomLists();

      expect(lists[0].createdAt).toBeInstanceOf(Date);
      expect(lists[0].updatedAt).toBeInstanceOf(Date);
      expect(lists[0].cards[0].createdAt).toBeInstanceOf(Date);
    });

    it("should handle corrupted data gracefully", () => {
      localStorage.setItem("kana_custom_lists", "invalid json");

      const lists = getAllCustomLists();

      expect(lists).toEqual([]);
    });
  });

  describe("getCustomList", () => {
    it("should return null for non-existent list", () => {
      const list = getCustomList("non-existent-id");

      expect(list).toBeNull();
    });

    it("should return the correct list by ID", () => {
      const list1 = createTestList("List 1");
      const list2 = createTestList("List 2");

      saveCustomList(list1);
      saveCustomList(list2);

      const retrieved = getCustomList(list1.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe("List 1");
      expect(retrieved?.id).toBe(list1.id);
    });

    it("should include all cards in the list", () => {
      const list = createTestList("Test List", 5);
      saveCustomList(list);

      const retrieved = getCustomList(list.id);

      expect(retrieved?.cards.length).toBe(5);
    });
  });

  describe("saveCustomList", () => {
    it("should save a new list", () => {
      const list = createTestList("New List");

      saveCustomList(list);

      const lists = getAllCustomLists();
      expect(lists.length).toBe(1);
      expect(lists[0].name).toBe("New List");
    });

    it("should update existing list", () => {
      const list = createTestList("Original Name");
      saveCustomList(list);

      list.name = "Updated Name";
      saveCustomList(list);

      const lists = getAllCustomLists();
      expect(lists.length).toBe(1);
      expect(lists[0].name).toBe("Updated Name");
    });

    it("should update the updatedAt timestamp", () => {
      const list = createTestList("Test List");
      const originalUpdated = list.updatedAt;

      // Wait a bit to ensure timestamp difference
      vi.useFakeTimers();
      saveCustomList(list);
      vi.advanceTimersByTime(1000);

      list.name = "Updated";
      saveCustomList(list);
      vi.useRealTimers();

      const retrieved = getCustomList(list.id);
      expect(retrieved?.updatedAt.getTime()).not.toBe(
        originalUpdated.getTime(),
      );
    });

    it("should preserve performance metrics", () => {
      const list = createTestList("Test List");
      list.cards[0].performance.viewCount = 10;
      list.cards[0].performance.correctCount = 8;
      list.cards[0].performance.masteryLevel = 80;

      saveCustomList(list);

      const retrieved = getCustomList(list.id);
      expect(retrieved?.cards[0].performance.viewCount).toBe(10);
      expect(retrieved?.cards[0].performance.correctCount).toBe(8);
      expect(retrieved?.cards[0].performance.masteryLevel).toBe(80);
    });
  });

  describe("deleteCustomList", () => {
    it("should delete a list by ID", () => {
      const list1 = createTestList("List 1");
      const list2 = createTestList("List 2");

      saveCustomList(list1);
      saveCustomList(list2);

      deleteCustomList(list1.id);

      const lists = getAllCustomLists();
      expect(lists.length).toBe(1);
      expect(lists[0].name).toBe("List 2");
    });

    it("should not throw when deleting non-existent list", () => {
      expect(() => deleteCustomList("non-existent")).not.toThrow();
    });

    it("should delete all cards with the list", () => {
      const list = createTestList("Test List", 10);
      saveCustomList(list);

      deleteCustomList(list.id);

      const retrieved = getCustomList(list.id);
      expect(retrieved).toBeNull();
    });
  });

  describe("duplicateCustomList", () => {
    it("should create a duplicate with new name", () => {
      const original = createTestList("Original");
      saveCustomList(original);

      const duplicate = duplicateCustomList(original.id, "Duplicate");

      expect(duplicate.name).toBe("Duplicate");
      expect(duplicate.id).not.toBe(original.id);
    });

    it("should copy all cards", () => {
      const original = createTestList("Original", 5);
      saveCustomList(original);

      const duplicate = duplicateCustomList(original.id, "Duplicate");

      expect(duplicate.cards.length).toBe(5);
    });

    it("should give cards new IDs", () => {
      const original = createTestList("Original");
      saveCustomList(original);

      const duplicate = duplicateCustomList(original.id, "Duplicate");

      expect(duplicate.cards[0].id).not.toBe(original.cards[0].id);
    });

    it("should reset performance metrics", () => {
      const original = createTestList("Original");
      original.cards[0].performance.viewCount = 10;
      original.cards[0].performance.masteryLevel = 80;
      saveCustomList(original);

      const duplicate = duplicateCustomList(original.id, "Duplicate");

      expect(duplicate.cards[0].performance.viewCount).toBe(0);
      expect(duplicate.cards[0].performance.masteryLevel).toBe(0);
    });

    it("should throw error for non-existent list", () => {
      expect(() =>
        duplicateCustomList("non-existent", "New Name"),
      ).toThrow("Liste ikke funnet");
    });

    it("should preserve card content", () => {
      const original = createTestList("Original");
      original.cards[0].front = "Front Content";
      original.cards[0].back = "Back Content";
      saveCustomList(original);

      const duplicate = duplicateCustomList(original.id, "Duplicate");

      expect(duplicate.cards[0].front).toBe("Front Content");
      expect(duplicate.cards[0].back).toBe("Back Content");
    });

    it("should save the duplicate to storage", () => {
      const original = createTestList("Original");
      saveCustomList(original);

      const duplicate = duplicateCustomList(original.id, "Duplicate");

      const lists = getAllCustomLists();
      expect(lists.length).toBe(2);
      expect(lists.some((l) => l.id === duplicate.id)).toBe(true);
    });
  });

  describe("exportList", () => {
    it("should export list as JSON string", () => {
      const list = createTestList("Export Test");
      saveCustomList(list);

      const exported = exportList(list.id);

      expect(typeof exported).toBe("string");
      const parsed = JSON.parse(exported);
      expect(parsed.name).toBe("Export Test");
    });

    it("should throw error for non-existent list", () => {
      expect(() => exportList("non-existent")).toThrow(
        "Liste ikke funnet",
      );
    });

    it("should include all cards in export", () => {
      const list = createTestList("Export Test", 5);
      saveCustomList(list);

      const exported = exportList(list.id);
      const parsed = JSON.parse(exported);

      expect(parsed.cards.length).toBe(5);
    });

    it("should serialize dates as ISO strings", () => {
      const list = createTestList("Export Test");
      saveCustomList(list);

      const exported = exportList(list.id);
      const parsed = JSON.parse(exported);

      expect(typeof parsed.createdAt).toBe("string");
      expect(parsed.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("importJsonAsList", () => {
    it("should import a valid list", () => {
      const list = createTestList("Original");
      saveCustomList(list);

      const exported = exportList(list.id);
      deleteCustomList(list.id);

      const imported = importJsonAsList(exported);

      expect(imported.name).toBe("Original");
      expect(imported.cards.length).toBe(list.cards.length);
    });

    it("should generate new ID for imported list", () => {
      const list = createTestList("Original");
      saveCustomList(list);

      const exported = exportList(list.id);
      const imported = importJsonAsList(exported);

      expect(imported.id).not.toBe(list.id);
    });

    it("should reset performance metrics", () => {
      const list = createTestList("Original");
      list.cards[0].performance.viewCount = 10;
      saveCustomList(list);

      const exported = exportList(list.id);
      const imported = importJsonAsList(exported);

      expect(imported.cards[0].performance.viewCount).toBe(0);
    });

    it("should throw error for invalid JSON", () => {
      expect(() => importJsonAsList("invalid json")).toThrow(
        "Kunne ikke importere liste",
      );
    });

    it("should throw error for missing required fields", () => {
      const invalid = JSON.stringify({ name: "Test" });

      expect(() => importJsonAsList(invalid)).toThrow(
        "Kunne ikke importere liste",
      );
    });

    it("should save imported list to storage", () => {
      const list = createTestList("Test");
      saveCustomList(list);
      const exported = exportList(list.id);

      deleteCustomList(list.id);
      const imported = importJsonAsList(exported);

      const lists = getAllCustomLists();
      expect(lists.length).toBe(1);
      expect(lists[0].id).toBe(imported.id);
    });
  });

  describe("addList", () => {
    it("should add a new list with generated IDs", () => {
      const list = createTestList("Test List");
      const originalId = list.id;

      const added = addList(list);

      expect(added.id).not.toBe(originalId);
      expect(added.name).toBe("Test List");
    });

    it("should reset performance metrics", () => {
      const list = createTestList("Test List");
      list.cards[0].performance.viewCount = 10;

      const added = addList(list);

      expect(added.cards[0].performance.viewCount).toBe(0);
    });

    it("should save the list to storage", () => {
      const list = createTestList("Test List");

      const added = addList(list);

      const lists = getAllCustomLists();
      expect(lists.length).toBe(1);
      expect(lists[0].id).toBe(added.id);
    });

    it("should generate new card IDs", () => {
      const list = createTestList("Test List");
      const originalCardId = list.cards[0].id;

      const added = addList(list);

      expect(added.cards[0].id).not.toBe(originalCardId);
    });
  });

  describe("listNameExists", () => {
    it("should return false when no lists exist", () => {
      expect(listNameExists("Any Name")).toBe(false);
    });

    it("should return true when list with name exists", () => {
      const list = createTestList("Existing List");
      saveCustomList(list);

      expect(listNameExists("Existing List")).toBe(true);
    });

    it("should return false when list with name does not exist", () => {
      const list = createTestList("Existing List");
      saveCustomList(list);

      expect(listNameExists("Non-Existent List")).toBe(false);
    });

    it("should be case sensitive", () => {
      const list = createTestList("Test List");
      saveCustomList(list);

      expect(listNameExists("test list")).toBe(false);
      expect(listNameExists("Test List")).toBe(true);
    });

    it("should handle multiple lists correctly", () => {
      const list1 = createTestList("List 1");
      const list2 = createTestList("List 2");
      const list3 = createTestList("List 3");

      saveCustomList(list1);
      saveCustomList(list2);
      saveCustomList(list3);

      expect(listNameExists("List 2")).toBe(true);
      expect(listNameExists("List 4")).toBe(false);
    });
  });

  describe("Date serialization/deserialization", () => {
    it("should preserve card lastReviewed date", () => {
      const list = createTestList("Test");
      list.cards[0].lastReviewed = new Date("2024-01-15");
      saveCustomList(list);

      const retrieved = getCustomList(list.id);
      expect(retrieved?.cards[0].lastReviewed).toBeInstanceOf(Date);
      expect(retrieved?.cards[0].lastReviewed?.toISOString()).toContain(
        "2024-01-15",
      );
    });

    it("should handle undefined lastReviewed", () => {
      const list = createTestList("Test");
      list.cards[0].lastReviewed = undefined;
      saveCustomList(list);

      const retrieved = getCustomList(list.id);
      expect(retrieved?.cards[0].lastReviewed).toBeUndefined();
    });

    it("should preserve performance lastReviewedAt", () => {
      const list = createTestList("Test");
      list.cards[0].performance.lastReviewedAt = new Date("2024-01-15");
      saveCustomList(list);

      const retrieved = getCustomList(list.id);
      expect(
        retrieved?.cards[0].performance.lastReviewedAt,
      ).toBeInstanceOf(Date);
    });
  });
});
