// Storage utilities for custom lists
import { exampleLists } from "$lib/data/exampleLists";
import type { KanaCharacter } from "$lib/data/kana";
import type {
  CustomList,
  CustomFlashCard,
  SerializedCustomList,
  SerializedCustomFlashCard,
} from "$lib/types/customLists";

const STORAGE_KEY = "kana_custom_lists";
const OLD_HIRAGANA_KEY = "kana_custom_hiragana";
const OLD_KATAKANA_KEY = "kana_custom_katakana";
const EXAMPLE_LISTS_KEY = "kana_example_lists_populated";

// Helper to check if we're in browser environment
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Serialization helpers
function serializeCard(card: CustomFlashCard): SerializedCustomFlashCard {
  return {
    ...card,
    createdAt: card.createdAt.toISOString(),
    lastReviewed: card.lastReviewed?.toISOString(),
  };
}

function deserializeCard(card: SerializedCustomFlashCard): CustomFlashCard {
  return {
    ...card,
    createdAt: new Date(card.createdAt),
    lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
  };
}

function serializeList(list: CustomList): SerializedCustomList {
  return {
    ...list,
    cards: list.cards.map(serializeCard),
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
  };
}

function deserializeList(list: SerializedCustomList): CustomList {
  return {
    ...list,
    cards: list.cards.map(deserializeCard),
    createdAt: new Date(list.createdAt),
    updatedAt: new Date(list.updatedAt),
  };
}

// Migration: Convert old single-list format to new multi-list format
function migrateOldData(): void {
  if (!isBrowser()) return;

  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (existingData) {
      // Already migrated
      return;
    }

    const lists: CustomList[] = [];

    // Check for old hiragana list
    const oldHiragana = localStorage.getItem(OLD_HIRAGANA_KEY);
    if (oldHiragana) {
      try {
        const oldCards: KanaCharacter[] = JSON.parse(oldHiragana);
        if (oldCards.length > 0) {
          const newList: CustomList = {
            id: generateId(),
            name: "Hiragana (migrert)",
            cards: oldCards.map(card => ({
              id: generateId(),
              front: card.character,
              back: card.romanization,
              type: "hiragana",
              createdAt: new Date(),
            })),
            createdAt: new Date(),
            updatedAt: new Date(),
            defaultDirection: "front-to-back",
          };
          lists.push(newList);
        }
      } catch (e) {
        console.error("Failed to migrate hiragana data:", e);
      }
    }

    // Check for old katakana list
    const oldKatakana = localStorage.getItem(OLD_KATAKANA_KEY);
    if (oldKatakana) {
      try {
        const oldCards: KanaCharacter[] = JSON.parse(oldKatakana);
        if (oldCards.length > 0) {
          const newList: CustomList = {
            id: generateId(),
            name: "Katakana (migrert)",
            cards: oldCards.map(card => ({
              id: generateId(),
              front: card.character,
              back: card.romanization,
              type: "katakana",
              createdAt: new Date(),
            })),
            createdAt: new Date(),
            updatedAt: new Date(),
            defaultDirection: "front-to-back",
          };
          lists.push(newList);
        }
      } catch (e) {
        console.error("Failed to migrate katakana data:", e);
      }
    }

    // Save migrated data
    if (lists.length > 0) {
      const serialized = lists.map(serializeList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));

      // Remove old keys
      localStorage.removeItem(OLD_HIRAGANA_KEY);
      localStorage.removeItem(OLD_KATAKANA_KEY);

      console.log(`Migrated ${lists.length} lists from old format`);
    }
  } catch (e) {
    console.error("Migration failed:", e);
  }
}

// Initialize example lists on first load
function initializeExampleLists(): void {
  if (!isBrowser()) return;

  try {
    const hasBeenPopulated = localStorage.getItem(EXAMPLE_LISTS_KEY);
    if (hasBeenPopulated) {
      // Already populated
      return;
    }

    const existingLists = getAllCustomLists();

    // Only populate if there are no custom lists
    if (existingLists.length === 0 && exampleLists.length > 0) {
      const serialized = exampleLists.map(serializeList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
      localStorage.setItem(EXAMPLE_LISTS_KEY, "true");

      console.log(`Initialized ${exampleLists.length} example lists`);
    }
  } catch (e) {
    console.error("Failed to initialize example lists:", e);
  }
}

// Initialize and run migration if needed
if (isBrowser()) {
  migrateOldData();
  initializeExampleLists();
}

// Get all custom lists
export function getAllCustomLists(): CustomList[] {
  if (!isBrowser()) return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const serialized: SerializedCustomList[] = JSON.parse(data);
    return serialized.map(deserializeList);
  } catch (e) {
    console.error("Failed to load custom lists:", e);
    return [];
  }
}

// Get specific custom list by ID
export function getCustomList(id: string): CustomList | null {
  const lists = getAllCustomLists();
  return lists.find(list => list.id === id) || null;
}

// Save or update a custom list
export function saveCustomList(list: CustomList): void {
  if (!isBrowser()) return;

  try {
    const lists = getAllCustomLists();
    const existingIndex = lists.findIndex(l => l.id === list.id);

    // Update timestamp
    list.updatedAt = new Date();

    if (existingIndex >= 0) {
      lists[existingIndex] = list;
    } else {
      lists.push(list);
    }

    const serialized = lists.map(serializeList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (e) {
    console.error("Failed to save custom list:", e);
    throw new Error("Kunne ikke lagre liste");
  }
}

// Delete a custom list
export function deleteCustomList(id: string): void {
  if (!isBrowser()) return;

  try {
    const lists = getAllCustomLists();
    const filtered = lists.filter(list => list.id !== id);

    const serialized = filtered.map(serializeList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (e) {
    console.error("Failed to delete custom list:", e);
    throw new Error("Kunne ikke slette liste");
  }
}

// Duplicate a custom list
export function duplicateCustomList(id: string, newName: string): CustomList {
  const original = getCustomList(id);
  if (!original) {
    throw new Error("Liste ikke funnet");
  }

  const duplicate: CustomList = {
    id: generateId(),
    name: newName,
    cards: original.cards.map(card => ({
      ...card,
      id: generateId(),
      createdAt: new Date(),
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
    defaultDirection: original.defaultDirection,
  };

  saveCustomList(duplicate);
  return duplicate;
}

// Export list as JSON string
export function exportList(id: string): string {
  const list = getCustomList(id);
  if (!list) {
    throw new Error("Liste ikke funnet");
  }

  const serialized = serializeList(list);
  return JSON.stringify(serialized, null, 2);
}

// Import list from JSON string
export function importList(jsonString: string): CustomList {
  try {
    const serialized: SerializedCustomList = JSON.parse(jsonString);

    // Validate structure
    if (!serialized.id || !serialized.name || !serialized.cards) {
      throw new Error("Ugyldig liste-format");
    }

    // Generate new ID to avoid conflicts
    const list = deserializeList(serialized);
    list.id = generateId();
    list.createdAt = new Date();
    list.updatedAt = new Date();

    // Regenerate card IDs
    list.cards = list.cards.map(card => ({
      ...card,
      id: generateId(),
      createdAt: new Date(),
    }));

    saveCustomList(list);
    return list;
  } catch (e) {
    console.error("Failed to import list:", e);
    throw new Error("Kunne ikke importere liste. Sjekk at formatet er gyldig.");
  }
}
