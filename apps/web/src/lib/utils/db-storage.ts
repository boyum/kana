// Database storage utilities for custom lists
import type { CustomList, CustomFlashCard } from "$lib/types/customLists";
import { supabaseAdmin } from "$lib/supabase.server";
import { createEmptyPerformanceMetrics } from "./performance";

// Database types that match our SQL schema
interface DbList {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  is_public: boolean;
  default_direction: "front-to-back" | "back-to-front";
  is_example: boolean;
  is_test_data: boolean;
  created_at: string;
  updated_at: string;
}

interface DbCard {
  id: string;
  list_id: string;
  front: string;
  back: string;
  meaning: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  last_reviewed_at: string | null;
  view_count: number;
  flip_count: number;
  correct_count: number;
  incorrect_count: number;
  total_response_time_ms: number;
  fastest_response_ms: number | null;
  slowest_response_ms: number | null;
  mastery_level: number;
}

// Convert database list and cards to CustomList type
function dbToCustomList(dbList: DbList, dbCards: DbCard[]): CustomList {
  return {
    id: dbList.id,
    name: dbList.name,
    cards: dbCards.map(dbCard => ({
      id: dbCard.id,
      front: dbCard.front,
      back: dbCard.back,
      meaning: dbCard.meaning || undefined,
      notes: dbCard.notes || undefined,
      tags: dbCard.tags,
      createdAt: new Date(dbCard.created_at),
      lastReviewed: dbCard.last_reviewed_at
        ? new Date(dbCard.last_reviewed_at)
        : undefined,
      performance: {
        viewCount: dbCard.view_count,
        flipCount: dbCard.flip_count,
        correctCount: dbCard.correct_count,
        incorrectCount: dbCard.incorrect_count,
        totalResponseTimeMs: dbCard.total_response_time_ms,
        fastestResponseMs: dbCard.fastest_response_ms || undefined,
        slowestResponseMs: dbCard.slowest_response_ms || undefined,
        lastReviewedAt: dbCard.last_reviewed_at
          ? new Date(dbCard.last_reviewed_at)
          : undefined,
        masteryLevel: dbCard.mastery_level,
      },
    })),
    createdAt: new Date(dbList.created_at),
    updatedAt: new Date(dbList.updated_at),
    defaultDirection: dbList.default_direction,
  };
}

// Get all custom lists for a user (or public lists)
export async function getAllCustomListsFromDb(
  userId?: string,
): Promise<CustomList[]> {
  try {
    let query = supabaseAdmin.from("lists").select(`
        id,
        user_id,
        name,
        description,
        is_public,
        default_direction,
        is_example,
        is_test_data,
        created_at,
        updated_at
      `);

    if (userId) {
      // Get user's own lists and public lists
      query = query.or(`user_id.eq.${userId},is_public.eq.true`);
    } else {
      // Get only public lists if no user
      query = query.eq("is_public", true);
    }

    const { data: lists, error: listsError } = await query;

    if (listsError) throw listsError;
    if (!lists || lists.length === 0) return [];

    // Get all cards for these lists
    const listIds = lists.map(l => l.id);
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from("cards")
      .select("*")
      .in("list_id", listIds);

    if (cardsError) throw cardsError;

    // Group cards by list_id
    const cardsByList = new Map<string, DbCard[]>();
    if (cards) {
      for (const card of cards) {
        const listCards = cardsByList.get(card.list_id) || [];
        listCards.push(card as DbCard);
        cardsByList.set(card.list_id, listCards);
      }
    }

    // Combine lists with their cards
    return lists.map(list =>
      dbToCustomList(list as DbList, cardsByList.get(list.id) || []),
    );
  } catch (e) {
    console.error("Failed to load custom lists from database:", e);
    return [];
  }
}

// Get specific custom list by ID
export async function getCustomListFromDb(
  id: string,
  userId?: string,
): Promise<CustomList | null> {
  try {
    let query = supabaseAdmin
      .from("lists")
      .select("*")
      .eq("id", id)
      .single();

    const { data: list, error: listError } = await query;

    if (listError || !list) return null;

    // Check permissions
    if (userId) {
      if (list.user_id !== userId && !list.is_public) {
        return null; // User doesn't have access
      }
    } else if (!list.is_public) {
      return null; // Not public, can't access
    }

    // Get cards for this list
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from("cards")
      .select("*")
      .eq("list_id", id);

    if (cardsError) throw cardsError;

    return dbToCustomList(list as DbList, (cards as DbCard[]) || []);
  } catch (e) {
    console.error("Failed to load custom list from database:", e);
    return null;
  }
}

// Save or update a custom list
export async function saveCustomListToDb(
  list: CustomList,
  userId: string,
  isExample = false,
  isTestData = false,
): Promise<void> {
  try {
    // Check if list exists
    const { data: existingList } = await supabaseAdmin
      .from("lists")
      .select("id, user_id")
      .eq("id", list.id)
      .single();

    const listData = {
      id: list.id,
      user_id: userId,
      name: list.name,
      description: null,
      is_public: false,
      default_direction: list.defaultDirection || "front-to-back",
      is_example: isExample,
      is_test_data: isTestData,
      updated_at: new Date().toISOString(),
    };

    if (existingList) {
      // Update existing list
      const { error: updateError } = await supabaseAdmin
        .from("lists")
        .update(listData)
        .eq("id", list.id);

      if (updateError) throw updateError;

      // Delete existing cards and insert new ones
      const { error: deleteError } = await supabaseAdmin
        .from("cards")
        .delete()
        .eq("list_id", list.id);

      if (deleteError) throw deleteError;
    } else {
      // Insert new list
      const { error: insertError } = await supabaseAdmin
        .from("lists")
        .insert({
          ...listData,
          created_at: list.createdAt.toISOString(),
        });

      if (insertError) throw insertError;
    }

    // Insert cards
    if (list.cards.length > 0) {
      const cardData = list.cards.map(card => ({
        id: card.id,
        list_id: list.id,
        front: card.front,
        back: card.back,
        meaning: card.meaning || null,
        notes: card.notes || null,
        tags: card.tags || [],
        created_at: card.createdAt.toISOString(),
        updated_at: new Date().toISOString(),
        last_reviewed_at: card.lastReviewed?.toISOString() || null,
        view_count: card.performance.viewCount,
        flip_count: card.performance.flipCount,
        correct_count: card.performance.correctCount,
        incorrect_count: card.performance.incorrectCount,
        total_response_time_ms: card.performance.totalResponseTimeMs,
        fastest_response_ms: card.performance.fastestResponseMs || null,
        slowest_response_ms: card.performance.slowestResponseMs || null,
        mastery_level: card.performance.masteryLevel,
      }));

      const { error: cardsError } = await supabaseAdmin
        .from("cards")
        .insert(cardData);

      if (cardsError) throw cardsError;
    }
  } catch (e) {
    console.error("Failed to save custom list to database:", e);
    throw new Error("Kunne ikke lagre liste");
  }
}

// Delete a custom list
export async function deleteCustomListFromDb(
  id: string,
  userId: string,
): Promise<void> {
  try {
    // Verify ownership
    const { data: list } = await supabaseAdmin
      .from("lists")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!list || list.user_id !== userId) {
      throw new Error("Ingen tilgang til å slette denne listen");
    }

    // Delete list (cards will be deleted automatically due to CASCADE)
    const { error } = await supabaseAdmin.from("lists").delete().eq("id", id);

    if (error) throw error;
  } catch (e) {
    console.error("Failed to delete custom list from database:", e);
    throw new Error("Kunne ikke slette liste");
  }
}

// Get all example lists
export async function getExampleLists(): Promise<CustomList[]> {
  try {
    const { data: lists, error: listsError } = await supabaseAdmin
      .from("lists")
      .select("*")
      .eq("is_example", true);

    if (listsError) throw listsError;
    if (!lists || lists.length === 0) return [];

    // Get all cards for these lists
    const listIds = lists.map(l => l.id);
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from("cards")
      .select("*")
      .in("list_id", listIds);

    if (cardsError) throw cardsError;

    // Group cards by list_id
    const cardsByList = new Map<string, DbCard[]>();
    if (cards) {
      for (const card of cards) {
        const listCards = cardsByList.get(card.list_id) || [];
        listCards.push(card as DbCard);
        cardsByList.set(card.list_id, listCards);
      }
    }

    // Combine lists with their cards
    return lists.map(list =>
      dbToCustomList(list as DbList, cardsByList.get(list.id) || []),
    );
  } catch (e) {
    console.error("Failed to load example lists from database:", e);
    return [];
  }
}
