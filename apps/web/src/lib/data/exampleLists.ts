/**
 * @deprecated This file contains hardcoded example lists used ONLY for database population.
 *
 * DO NOT import this file directly in the application code.
 * Instead, use `getExampleLists()` from "$lib/utils/db-storage" to fetch example lists from the database.
 *
 * This file is kept only for the populate-example-lists.ts script to seed the database.
 */

import type { CustomList } from "$lib/types/customLists";
import { createEmptyPerformanceMetrics } from "$lib/utils/performance";
import { generateId } from "$lib/utils/storage";

// Helper function to create example lists with consistent structure
function createExampleList(
  name: string,
  cards: Array<{
    front: string;
    back: string;
    meaning?: string;
    notes?: string;
    tags?: string[];
  }>,
  defaultDirection: "front-to-back" | "back-to-front" = "front-to-back",
): CustomList {
  const now = new Date();
  return {
    id: generateId(),
    name,
    cards: cards.map(card => ({
      id: generateId(),
      front: card.front,
      back: card.back,
      notes: card.notes,
      tags: card.tags,
      createdAt: now,
      performance: createEmptyPerformanceMetrics(),
    })),
    createdAt: now,
    updatedAt: now,
    defaultDirection,
  };
}

// Example lists for pre-population
export const exampleLists: CustomList[] = [
  createExampleList("Tysk til norsk for nybegynnere", [
    {
      front: "Hallo",
      back: "Hallo",
      tags: ["greetings", "beginner"],
    },
    {
      front: "Guten Morgen",
      back: "God morgen",
      tags: ["greetings", "beginner"],
    },
    {
      front: "Gute Nacht",
      back: "God natt",
      tags: ["greetings", "beginner"],
    },
    {
      front: "Danke",
      back: "Takk",
      tags: ["politeness", "beginner"],
    },
    {
      front: "Bitte",
      back: "Vær så snill / Vær så god",
      tags: ["politeness", "beginner"],
    },
    {
      front: "Ja",
      back: "Ja",
      tags: ["basic", "beginner"],
    },
    {
      front: "Nein",
      back: "Nei",
      tags: ["basic", "beginner"],
    },
    {
      front: "Entschuldigung",
      back: "Unnskyld",
      tags: ["politeness", "beginner"],
    },
    {
      front: "Wie geht es dir?",
      back: "Hvordan går det?",
      tags: ["greetings", "beginner"],
    },
    {
      front: "Mir geht es gut",
      back: "Det går bra med meg",
      tags: ["greetings", "beginner"],
    },
  ]),

  createExampleList("I butikken - japansk til norsk for nybegynnere", [
    {
      front: "いくらですか？",
      back: "Hvor mye koster det?",
      tags: ["shopping", "beginner"],
    },
    {
      front: "これをください",
      back: "Jeg vil gjerne ha dette",
      tags: ["shopping", "beginner"],
    },
    {
      front: "ありがとう",
      back: "Takk",
      tags: ["politeness", "beginner"],
    },
    {
      front: "すみません",
      back: "Unnskyld",
      tags: ["politeness", "beginner"],
    },
    {
      front: "トイレ",
      back: "Toalett",
      tags: ["places", "beginner"],
    },
    {
      front: "レジ",
      back: "Kasse",
      tags: ["shopping", "beginner"],
    },
    {
      front: "クレジットカード",
      back: "Kredittkort",
      tags: ["shopping", "beginner"],
    },
    {
      front: "現金",
      back: "Kontanter",
      tags: ["shopping", "beginner"],
    },
    {
      front: "袋",
      back: "Pose",
      tags: ["shopping", "beginner"],
    },
    {
      front: "割引",
      back: "Rabatt",
      tags: ["shopping", "beginner"],
    },
  ]),

  createExampleList("Dyr på norsk", [
    {
      front: "Dog",
      back: "Hund",
      tags: ["animals", "pets", "beginner"],
    },
    {
      front: "Cat",
      back: "Katt",
      tags: ["animals", "pets", "beginner"],
    },
    {
      front: "Fish",
      back: "Fisk",
      tags: ["animals", "water", "beginner"],
    },
    {
      front: "Bird",
      back: "Fugl",
      tags: ["animals", "beginner"],
    },
    {
      front: "Elephant",
      back: "Elefant",
      tags: ["animals", "wild"],
    },
    {
      front: "Lion",
      back: "Løve",
      tags: ["animals", "wild", "predators"],
    },
    {
      front: "Tiger",
      back: "Tiger",
      tags: ["animals", "wild", "predators"],
    },
    {
      front: "Bear",
      back: "Bjørn",
      tags: ["animals", "wild"],
    },
    {
      front: "Snake",
      back: "Rørslange",
      tags: ["animals", "reptiles"],
    },
    {
      front: "Frog",
      back: "Frosk",
      tags: ["animals", "water", "amphibians"],
    },
  ]),

  createExampleList("Mat og drikke", [
    {
      front: "Bread",
      back: "Brød",
      tags: ["food", "beginner"],
    },
    {
      front: "Meat",
      back: "Kjøtt",
      tags: ["food", "protein", "beginner"],
    },
    {
      front: "Fish",
      back: "Fisk",
      tags: ["food", "protein", "beginner"],
    },
    {
      front: "Milk",
      back: "Melk",
      tags: ["drinks", "dairy", "beginner"],
    },
    {
      front: "Cheese",
      back: "Ost",
      tags: ["food", "dairy", "beginner"],
    },
    {
      front: "Egg",
      back: "Egg",
      tags: ["food", "protein", "beginner"],
    },
    {
      front: "Vegetables",
      back: "Grønnsaker",
      tags: ["food", "healthy", "beginner"],
    },
    {
      front: "Fruit",
      back: "Frukt",
      tags: ["food", "healthy", "beginner"],
    },
    {
      front: "Coffee",
      back: "Kaffe",
      tags: ["drinks", "beginner"],
    },
    {
      front: "Tea",
      back: "Te",
      tags: ["drinks", "beginner"],
    },
    {
      front: "Water",
      back: "Vann",
      tags: ["drinks", "beginner"],
    },
    {
      front: "Wine",
      back: "Vin",
      tags: ["drinks", "alcohol"],
    },
  ]),

  createExampleList("Familie på norsk", [
    {
      front: "Father",
      back: "Far",
      tags: ["family", "beginner"],
    },
    {
      front: "Mother",
      back: "Mor",
      tags: ["family", "beginner"],
    },
    {
      front: "Son",
      back: "Sønn",
      tags: ["family", "beginner"],
    },
    {
      front: "Daughter",
      back: "Datter",
      tags: ["family", "beginner"],
    },
    {
      front: "Brother",
      back: "Bror",
      tags: ["family", "beginner"],
    },
    {
      front: "Sister",
      back: "Søster",
      tags: ["family", "beginner"],
    },
    {
      front: "Grandfather",
      back: "Bestefar",
      tags: ["family", "beginner"],
    },
    {
      front: "Grandmother",
      back: "Bestemor",
      tags: ["family", "beginner"],
    },
    {
      front: "Uncle",
      back: "Onkel",
      tags: ["family", "beginner"],
    },
    {
      front: "Aunt",
      back: "Tante",
      tags: ["family", "beginner"],
    },
  ]),

  createExampleList("Fargene", [
    {
      front: "Red",
      back: "Rød",
      tags: ["colors", "beginner"],
    },
    {
      front: "Blue",
      back: "Blå",
      tags: ["colors", "beginner"],
    },
    {
      front: "Yellow",
      back: "Gul",
      tags: ["colors", "beginner"],
    },
    {
      front: "Green",
      back: "Grønn",
      tags: ["colors", "beginner"],
    },
    {
      front: "Black",
      back: "Sort",
      tags: ["colors", "beginner"],
    },
    {
      front: "White",
      back: "Hvit",
      tags: ["colors", "beginner"],
    },
    {
      front: "Gray",
      back: "Grå",
      tags: ["colors", "beginner"],
    },
    {
      front: "Pink",
      back: "Rosa",
      tags: ["colors", "beginner"],
    },
    {
      front: "Purple",
      back: "Lilla",
      tags: ["colors", "beginner"],
    },
    {
      front: "Orange",
      back: "Oransj",
      tags: ["colors", "beginner"],
    },
  ]),

  createExampleList("Hiking Trail Vocabulary - Amharic to Norwegian", [
    {
      front: "ተራራ",
      back: "Fjell",
      tags: ["hiking", "nature"],
    },
    {
      front: "መንገድ",
      back: "Sti",
      tags: ["hiking", "nature"],
    },
    {
      front: "ጫፍ",
      back: "Topp",
      tags: ["hiking", "nature"],
    },
    {
      front: "ሸለቆ",
      back: "Dal",
      tags: ["hiking", "nature"],
    },
    {
      front: "ድንጋይ",
      back: "Stein",
      tags: ["hiking", "nature"],
    },
    {
      front: "ደን",
      back: "Skog",
      tags: ["hiking", "nature"],
    },
    {
      front: "ሞገድ",
      back: "Bekk",
      tags: ["hiking", "nature"],
    },
    {
      front: "እይታ",
      back: "Utsikt",
      tags: ["hiking", "nature"],
    },
    {
      front: "ማረፊያ",
      back: "Hvile",
      tags: ["hiking", "activity"],
    },
    {
      front: "ሐቂባ",
      back: "Ryggsekk",
      tags: ["hiking", "gear"],
    },
  ]),

  createExampleList("Kitchen Equipment - Arabic to Norwegian", [
    {
      front: "قدر",
      back: "Gryte",
      tags: ["kitchen", "cooking"],
    },
    {
      front: "مقلاة",
      back: "Panne",
      tags: ["kitchen", "cooking"],
    },
    {
      front: "سكين",
      back: "Kniv",
      tags: ["kitchen", "cooking"],
    },
    {
      front: "شوكة",
      back: "Gaffel",
      tags: ["kitchen", "utensils"],
    },
    {
      front: "ملعقة",
      back: "Skje",
      tags: ["kitchen", "utensils"],
    },
    {
      front: "طبق",
      back: "Tallerken",
      tags: ["kitchen", "dishes"],
    },
    {
      front: "كوب",
      back: "Kopp",
      tags: ["kitchen", "dishes"],
    },
    {
      front: "وعاء",
      back: "Bolle",
      tags: ["kitchen", "dishes"],
    },
    {
      front: "لوح التقطيع",
      back: "Skjærebrett",
      tags: ["kitchen", "cooking"],
    },
    {
      front: "فرن",
      back: "Ovn",
      tags: ["kitchen", "appliances"],
    },
  ]),

  createExampleList("Arabic Letters - Script to Romanization", [
    {
      front: "ا",
      back: "Alif",
      tags: ["arabic", "letters", "beginner"],
    },
    {
      front: "ب",
      back: "Ba",
      tags: ["arabic", "letters", "beginner"],
    },
    {
      front: "ت",
      back: "Ta",
      tags: ["arabic", "letters", "beginner"],
    },
    {
      front: "ث",
      back: "Tha",
      tags: ["arabic", "letters", "beginner"],
    },
    {
      front: "ج",
      back: "Jim",
      tags: ["arabic", "letters", "beginner"],
    },
    {
      front: "ح",
      back: "Ha",
      tags: ["arabic", "letters", "beginner"],
    },
    {
      front: "خ",
      back: "Kha",
      tags: ["arabic", "letters", "beginner"],
    },
    {
      front: "د",
      back: "Dal",
      tags: ["arabic", "letters", "beginner"],
    },
    {
      front: "ذ",
      back: "Dhal",
      tags: ["arabic", "letters", "beginner"],
    },
    {
      front: "ر",
      back: "Ra",
      tags: ["arabic", "letters", "beginner"],
    },
    {
      front: "ز",
      back: "Zay",
      tags: ["arabic", "letters", "beginner"],
    },
    {
      front: "س",
      back: "Sin",
      tags: ["arabic", "letters", "beginner"],
    },
  ]),
];

// Function to check if example lists have been populated
export function shouldPopulateExampleLists(
  existingLists: CustomList[],
): boolean {
  return existingLists.length === 0;
}
