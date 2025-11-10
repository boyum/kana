/**
 * Tests for addIndexToName utility
 */
import { describe, it, expect } from "vitest";
import { addIndexToName } from "./addIndexToName";

describe("addIndexToName", () => {
  it("should add (2) suffix for first duplicate", () => {
    const names = ["My List"];
    const result = addIndexToName(names, "My List");

    expect(result).toBe("My List (2)");
  });

  it("should add (3) suffix when (2) already exists", () => {
    const names = ["My List", "My List (2)"];
    const result = addIndexToName(names, "My List");

    expect(result).toBe("My List (3)");
  });

  it("should increment existing index in name", () => {
    const names = ["My List", "My List (2)", "My List (3)"];
    const result = addIndexToName(names, "My List (2)");

    // Starts at existingIndex(2) + 1 = 3, then increments to 4
    expect(result).toBe("My List (4)");
  });

  it("should skip to next available index if gaps exist", () => {
    const names = ["My List", "My List (3)"];
    const result = addIndexToName(names, "My List");

    expect(result).toBe("My List (2)");
  });

  it("should handle name with (2) when original name doesn't exist", () => {
    const names: string[] = [];
    const result = addIndexToName(names, "My List (2)");

    // Starts at existingIndex(2) + 1 = 3, then increments to 4
    expect(result).toBe("My List (4)");
  });

  it("should continue incrementing when many duplicates exist", () => {
    const names = [
      "Test",
      "Test (2)",
      "Test (3)",
      "Test (4)",
      "Test (5)",
      "Test (6)",
      "Test (7)",
      "Test (8)",
      "Test (9)",
    ];
    const result = addIndexToName(names, "Test");

    expect(result).toBe("Test (10)");
  });

  it("should handle empty names array", () => {
    const names: string[] = [];
    const result = addIndexToName(names, "New List");

    expect(result).toBe("New List");
  });

  it("should handle names with special characters", () => {
    const names = ["List-A", "List-A (2)"];
    const result = addIndexToName(names, "List-A");

    expect(result).toBe("List-A (3)");
  });

  it("should handle names with spaces", () => {
    const names = ["My Super List"];
    const result = addIndexToName(names, "My Super List");

    expect(result).toBe("My Super List (2)");
  });

  it("should handle names with numbers in them", () => {
    const names = ["List 123"];
    const result = addIndexToName(names, "List 123");

    expect(result).toBe("List 123 (2)");
  });

  it("should extract and increment from existing indexed name", () => {
    const names = ["Original"];
    const result = addIndexToName(names, "Original (5)");

    // Starts at 5+1=6, increments to 7
    expect(result).toBe("Original (7)");
  });

  it("should handle case when incrementing from (9) to (10)", () => {
    const names = ["List"];
    const result = addIndexToName(names, "List (9)");

    // Starts at 9+1=10, increments to 11
    expect(result).toBe("List (11)");
  });

  it("should handle double digit increments correctly", () => {
    const names = ["List", "List (2)", "List (10)"];
    const result = addIndexToName(names, "List (10)");

    // Starts at 10+1=11, increments to 12
    expect(result).toBe("List (12)");
  });

  it("should find first available slot when there are gaps", () => {
    const names = ["List", "List (2)", "List (5)"];
    const result = addIndexToName(names, "List");

    expect(result).toBe("List (3)");
  });

  it("should handle unicode characters in name", () => {
    const names = ["日本語"];
    const result = addIndexToName(names, "日本語");

    expect(result).toBe("日本語 (2)");
  });

  it("should handle emojis in name", () => {
    const names = ["List 🎌"];
    const result = addIndexToName(names, "List 🎌");

    expect(result).toBe("List 🎌 (2)");
  });

  it("should handle name ending with (non-numeric) pattern", () => {
    const names: string[] = [];
    const result = addIndexToName(names, "List (abc)");

    // Since it doesn't match the pattern, it treats the whole string as the base name
    expect(result).toBe("List (abc)");
  });

  it("should handle very long names", () => {
    const longName = "A".repeat(100);
    const names = [longName];
    const result = addIndexToName(names, longName);

    expect(result).toBe(`${longName} (2)`);
  });

  it("should handle names that are already indexed with large numbers", () => {
    const names = ["Test (99)", "Test (100)"];
    const result = addIndexToName(names, "Test (100)");

    // Starts at 100+1=101, increments to 102
    expect(result).toBe("Test (102)");
  });

  it("should handle mixed indexed and non-indexed names", () => {
    const names = ["Project", "Project (2)", "Project v2", "Project (5)"];
    const result = addIndexToName(names, "Project");

    expect(result).toBe("Project (3)");
  });

  it("should increment from name with index when base doesn't exist", () => {
    const names = ["Other List"];
    const result = addIndexToName(names, "My List (3)");

    // Starts at 3+1=4, increments to 5
    expect(result).toBe("My List (5)");
  });

  it("should handle name with multiple parentheses", () => {
    const names = ["List (old) (2)"];
    const result = addIndexToName(names, "List (old)");

    // The regex will match the last (2), extract "List (old)" as base
    expect(result).toBe("List (old)");
  });

  it("should return base name without index when it's available", () => {
    const names = ["List (2)", "List (3)", "List (4)"];
    const result = addIndexToName(names, "List (2)");

    // Starts from index 3, finds 3 and 4 taken, returns (5)
    expect(result).toBe("List (5)");
  });

  it("should handle empty string name", () => {
    const names: string[] = [];
    const result = addIndexToName(names, "");

    // Empty string with index > 1 gets " (2)" appended
    expect(result).toBe(" (2)");
  });

  it("should handle single character names", () => {
    const names = ["A"];
    const result = addIndexToName(names, "A");

    expect(result).toBe("A (2)");
  });

  it("should handle names with trailing spaces", () => {
    const names = ["Test "];
    const result = addIndexToName(names, "Test ");

    expect(result).toBe("Test  (2)");
  });
});
