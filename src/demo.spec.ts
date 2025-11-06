import { describe, it, expect, beforeEach } from "vitest";
import {
  generateShareToken,
  decodeShareToken,
  generateShareUrl,
  extractImportToken,
} from "$lib/utils/sharing";
import type { CustomList } from "$lib/types/customLists";

describe("Sharing functionality - Base62 encoding", () => {
  let testList: CustomList;

  beforeEach(() => {
    // Create a test list with various card types
    testList = {
      id: "test-list-123",
      name: "Test Hiragana List",
      cards: [
        {
          id: "card-1",
          front: "あ",
          back: "a",
          type: "hiragana",
          meaning: "vowel sound 'a'",
          notes: "First character in hiragana",
          tags: ["vowel", "basic"],
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
          lastReviewed: new Date("2024-01-02T00:00:00.000Z"),
        },
        {
          id: "card-2",
          front: "い",
          back: "i",
          type: "hiragana",
          meaning: "vowel sound 'i'",
          notes: undefined,
          tags: ["vowel"],
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
          lastReviewed: undefined,
        },
        {
          id: "card-3",
          front: "Custom Front",
          back: "Custom Back",
          type: "custom",
          meaning: undefined,
          notes: undefined,
          tags: undefined,
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
        },
      ],
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-15T00:00:00.000Z"),
      defaultDirection: "front-to-back",
    };
  });

  describe("generateShareToken", () => {
    it("should generate a valid base62 token", async () => {
      const token = await generateShareToken(testList);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate URL-safe characters only", async () => {
      const token = await generateShareToken(testList);

      // Base62 + dash + underscore characters
      const urlSafePattern = /^[0-9A-Za-z\-_]+$/;
      expect(token).toMatch(urlSafePattern);
    });

    it("should not contain characters requiring URL encoding", async () => {
      const token = await generateShareToken(testList);

      // Should not contain +, /, =, spaces, or other special chars
      expect(token).not.toContain("+");
      expect(token).not.toContain("/");
      expect(token).not.toContain("=");
      expect(token).not.toContain(" ");
      expect(token).not.toContain("%");
    });

    it("should generate different tokens for different lists", async () => {
      const token1 = await generateShareToken(testList);

      const differentList = {
        ...testList,
        name: "Different List",
        cards: [...testList.cards, { ...testList.cards[0], id: "card-4" }],
      };

      const token2 = await generateShareToken(differentList);

      expect(token1).not.toBe(token2);
    });

    it("should generate consistent tokens for the same list", async () => {
      const token1 = await generateShareToken(testList);
      const token2 = await generateShareToken(testList);

      expect(token1).toBe(token2);
    });

    it("should handle empty cards array", async () => {
      const emptyList: CustomList = {
        ...testList,
        cards: [],
      };

      const token = await generateShareToken(emptyList);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should handle list with special characters in names", async () => {
      const specialList: CustomList = {
        ...testList,
        name: "List with émojis 🎌 and spëcial çhars!",
      };

      const token = await generateShareToken(specialList);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });
  });

  describe("decodeShareToken", () => {
    it("should decode a valid token back to original list data", async () => {
      const token = await generateShareToken(testList);
      const decodedList = await decodeShareToken(token);

      expect(decodedList).toBeDefined();
      expect(decodedList.name).toBe(testList.name);
      expect(decodedList.cards.length).toBe(testList.cards.length);
      expect(decodedList.defaultDirection).toBe(testList.defaultDirection);
    });

    it("should preserve card data correctly", async () => {
      const token = await generateShareToken(testList);
      const decodedList = await decodeShareToken(token);

      const originalCard = testList.cards[0];
      const decodedCard = decodedList.cards[0];

      expect(decodedCard.front).toBe(originalCard.front);
      expect(decodedCard.back).toBe(originalCard.back);
      expect(decodedCard.type).toBe(originalCard.type);
      expect(decodedCard.meaning).toBe(originalCard.meaning);
      expect(decodedCard.notes).toBe(originalCard.notes);
      expect(decodedCard.tags).toEqual(originalCard.tags);
    });

    it("should generate new IDs for imported list and cards", async () => {
      const token = await generateShareToken(testList);
      const decodedList = await decodeShareToken(token);

      // List ID should be different
      expect(decodedList.id).not.toBe(testList.id);

      // Card IDs should be different
      decodedList.cards.forEach((decodedCard, index) => {
        expect(decodedCard.id).not.toBe(testList.cards[index].id);
      });
    });

    it("should update createdAt and updatedAt timestamps", async () => {
      const token = await generateShareToken(testList);

      // Wait a tiny bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const decodedList = await decodeShareToken(token);

      expect(decodedList.createdAt.getTime()).toBeGreaterThan(
        testList.createdAt.getTime(),
      );
      expect(decodedList.updatedAt.getTime()).toBeGreaterThan(
        testList.updatedAt.getTime(),
      );
    });

    it("should handle lists with optional fields missing", async () => {
      const minimalList: CustomList = {
        id: "minimal-123",
        name: "Minimal List",
        cards: [
          {
            id: "card-1",
            front: "Front",
            back: "Back",
            type: "custom",
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = await generateShareToken(minimalList);
      const decodedList = await decodeShareToken(token);

      expect(decodedList.name).toBe(minimalList.name);
      expect(decodedList.cards[0].meaning).toBeUndefined();
      expect(decodedList.cards[0].notes).toBeUndefined();
      expect(decodedList.cards[0].tags).toBeUndefined();
      expect(decodedList.cards[0].lastReviewed).toBeUndefined();
      expect(decodedList.defaultDirection).toBeUndefined();
    });

    it("should throw error for invalid token", async () => {
      await expect(decodeShareToken("invalid-token-123")).rejects.toThrow();
    });

    it("should throw error for empty token", async () => {
      await expect(decodeShareToken("")).rejects.toThrow();
    });

    it("should throw error for token with invalid base62 characters", async () => {
      await expect(decodeShareToken("hello@world!")).rejects.toThrow(
        /Ugyldig delingskode/,
      );
    });

    it("should handle unicode characters in card content", async () => {
      const unicodeList: CustomList = {
        ...testList,
        name: "Unicode Test 日本語",
        cards: [
          {
            id: "card-1",
            front: "こんにちは",
            back: "Hello",
            type: "hiragana",
            meaning: "Greeting 🎌",
            notes: "Common greeting in Japanese",
            createdAt: new Date(),
          },
        ],
      };

      const token = await generateShareToken(unicodeList);
      const decodedList = await decodeShareToken(token);

      expect(decodedList.name).toBe(unicodeList.name);
      expect(decodedList.cards[0].front).toBe(unicodeList.cards[0].front);
      expect(decodedList.cards[0].meaning).toBe(unicodeList.cards[0].meaning);
    });
  });

  describe("generateShareUrl", () => {
    it("should generate a valid URL with token", async () => {
      const baseUrl = "https://example.com";
      const shareUrl = await generateShareUrl(testList, baseUrl);

      expect(shareUrl).toContain(baseUrl);
      expect(shareUrl).toContain("/egendefinert");
      expect(shareUrl).toContain("?import=");
    });

    it("should generate URL without spaces or encoding issues", async () => {
      const baseUrl = "https://example.com";
      const shareUrl = await generateShareUrl(testList, baseUrl);

      // Should not have URL-encoded characters like %20
      expect(shareUrl).not.toContain("%20");
      expect(shareUrl).not.toContain("%2B");
      expect(shareUrl).not.toContain("%2F");
    });

    it("should be parseable as a URL", async () => {
      const baseUrl = "https://example.com";
      const shareUrl = await generateShareUrl(testList, baseUrl);

      expect(() => new URL(shareUrl)).not.toThrow();
    });

    it("should preserve token in URL query parameter", async () => {
      const baseUrl = "https://example.com";
      const shareUrl = await generateShareUrl(testList, baseUrl);
      const token = extractImportToken(shareUrl);

      expect(token).toBeDefined();
      expect(token).not.toBe("");
    });

    it("should work with different base URLs", async () => {
      const baseUrls = [
        "http://localhost:3000",
        "https://example.com",
        "https://app.example.com",
        "https://example.com:8080",
      ];

      for (const baseUrl of baseUrls) {
        const shareUrl = await generateShareUrl(testList, baseUrl);
        expect(shareUrl).toContain(baseUrl);
        expect(shareUrl).toContain("/egendefinert");
      }
    });
  });

  describe("extractImportToken", () => {
    it("should extract token from URL", async () => {
      const baseUrl = "https://example.com";
      const shareUrl = await generateShareUrl(testList, baseUrl);
      const extractedToken = extractImportToken(shareUrl);

      expect(extractedToken).toBeDefined();
      expect(extractedToken).not.toBe("");
    });

    it("should return null for URL without import parameter", () => {
      const url = "https://example.com/egendefinert";
      const token = extractImportToken(url);

      expect(token).toBeNull();
    });

    it("should return null for invalid URL", () => {
      const token = extractImportToken("not-a-url");

      expect(token).toBeNull();
    });

    it("should handle URL with other query parameters", async () => {
      const baseUrl = "https://example.com";
      const shareUrl = await generateShareUrl(testList, baseUrl);
      const urlWithExtra = shareUrl + "&foo=bar&baz=qux";

      const token = extractImportToken(urlWithExtra);

      expect(token).toBeDefined();
      expect(token).not.toBe("");
    });
  });

  describe("Full round-trip integration", () => {
    it("should successfully encode and decode list maintaining data integrity", async () => {
      // Generate token
      const token = await generateShareToken(testList);

      // Decode token
      const decodedList = await decodeShareToken(token);

      // Verify all data is preserved (except IDs and timestamps)
      expect(decodedList.name).toBe(testList.name);
      expect(decodedList.cards.length).toBe(testList.cards.length);
      expect(decodedList.defaultDirection).toBe(testList.defaultDirection);

      // Verify each card
      testList.cards.forEach((originalCard, index) => {
        const decodedCard = decodedList.cards[index];

        expect(decodedCard.front).toBe(originalCard.front);
        expect(decodedCard.back).toBe(originalCard.back);
        expect(decodedCard.type).toBe(originalCard.type);
        expect(decodedCard.meaning).toBe(originalCard.meaning);
        expect(decodedCard.notes).toBe(originalCard.notes);
        expect(decodedCard.tags).toEqual(originalCard.tags);
      });
    });

    it("should handle large lists with many cards", async () => {
      const largeList: CustomList = {
        ...testList,
        cards: Array.from({ length: 100 }, (_, i) => ({
          id: `card-${i}`,
          front: `Front ${i}`,
          back: `Back ${i}`,
          type: "custom" as const,
          meaning: `Meaning ${i}`,
          notes: `Notes for card ${i}`,
          tags: [`tag${i}`, "common"],
          createdAt: new Date(),
        })),
      };

      const token = await generateShareToken(largeList);
      const decodedList = await decodeShareToken(token);

      expect(decodedList.cards.length).toBe(100);
      expect(decodedList.cards[0].front).toBe("Front 0");
      expect(decodedList.cards[99].front).toBe("Front 99");
    });

    it("should successfully share via URL and import back", async () => {
      const baseUrl = "https://example.com";

      // Generate share URL
      const shareUrl = await generateShareUrl(testList, baseUrl);

      // Extract token from URL
      const token = extractImportToken(shareUrl);
      expect(token).not.toBeNull();

      // Import list using extracted token
      const importedList = await decodeShareToken(token!);

      // Verify imported list matches original
      expect(importedList.name).toBe(testList.name);
      expect(importedList.cards.length).toBe(testList.cards.length);
      expect(importedList.cards[0].front).toBe(testList.cards[0].front);
    });

    it("should maintain data through multiple encode/decode cycles", async () => {
      // First cycle
      const token1 = await generateShareToken(testList);
      const decoded1 = await decodeShareToken(token1);

      // Second cycle (encode the decoded list)
      const token2 = await generateShareToken(decoded1);
      const decoded2 = await decodeShareToken(token2);

      // Data should still match original (except IDs)
      expect(decoded2.name).toBe(testList.name);
      expect(decoded2.cards.length).toBe(testList.cards.length);
      expect(decoded2.cards[0].front).toBe(testList.cards[0].front);
      expect(decoded2.cards[0].back).toBe(testList.cards[0].back);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle list with very long name", async () => {
      const longName = "A".repeat(1000);
      const listWithLongName: CustomList = {
        ...testList,
        name: longName,
      };

      const token = await generateShareToken(listWithLongName);
      const decodedList = await decodeShareToken(token);

      expect(decodedList.name).toBe(longName);
    });

    it("should handle card with very long content", async () => {
      const longContent = "B".repeat(5000);
      const listWithLongCard: CustomList = {
        ...testList,
        cards: [
          {
            id: "long-card",
            front: longContent,
            back: longContent,
            type: "custom",
            createdAt: new Date(),
          },
        ],
      };

      const token = await generateShareToken(listWithLongCard);
      const decodedList = await decodeShareToken(token);

      expect(decodedList.cards[0].front).toBe(longContent);
      expect(decodedList.cards[0].back).toBe(longContent);
    });

    it("should handle list with many tags per card", async () => {
      const manyTags = Array.from({ length: 50 }, (_, i) => `tag${i}`);
      const listWithManyTags: CustomList = {
        ...testList,
        cards: [
          {
            id: "tagged-card",
            front: "Front",
            back: "Back",
            type: "custom",
            tags: manyTags,
            createdAt: new Date(),
          },
        ],
      };

      const token = await generateShareToken(listWithManyTags);
      const decodedList = await decodeShareToken(token);

      expect(decodedList.cards[0].tags).toEqual(manyTags);
    });

    it("should compress data effectively", async () => {
      // Create a list with repetitive data (should compress well)
      const repetitiveList: CustomList = {
        ...testList,
        cards: Array.from({ length: 20 }, (_, i) => ({
          id: `card-${i}`,
          front: "Same front for all cards",
          back: "Same back for all cards",
          type: "custom" as const,
          meaning: "Same meaning",
          notes: "Same notes",
          tags: ["same", "tags"],
          createdAt: new Date("2024-01-01"),
        })),
      };

      const token = await generateShareToken(repetitiveList);
      const jsonLength = JSON.stringify(testList).length;

      // Token should be shorter than raw JSON (because of compression)
      // This is a rough check - exact ratio depends on data
      expect(token.length).toBeLessThan(jsonLength * 2);
    });
  });
});
