// Type definitions for custom lists functionality

export interface CustomFlashCard {
  id: string; // Unique identifier
  front: string; // Front side content
  back: string; // Back side content
  type: "hiragana" | "katakana" | "mixed" | "custom";
  meaning?: string; // Optional meaning/translation
  notes?: string; // Optional study notes
  tags?: string[]; // Optional tags for filtering
  createdAt: Date;
  lastReviewed?: Date;
}

export interface CustomList {
  id: string; // Unique identifier
  name: string; // User-defined list name
  cards: CustomFlashCard[];
  createdAt: Date;
  updatedAt: Date;
  defaultDirection?: "front-to-back" | "back-to-front"; // Default practice direction
}

// For serialization/deserialization
export interface SerializedCustomFlashCard {
  id: string;
  front: string;
  back: string;
  type: "hiragana" | "katakana" | "mixed" | "custom";
  meaning?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  lastReviewed?: string;
}

export interface SerializedCustomList {
  id: string;
  name: string;
  type: "hiragana" | "katakana" | "mixed" | "custom";
  cards: SerializedCustomFlashCard[];
  createdAt: string;
  updatedAt: string;
  defaultDirection?: "front-to-back" | "back-to-front";
}
