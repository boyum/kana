#!/usr/bin/env tsx
// Script to populate the database with example lists
import { supabaseAdmin } from "./supabase-client";
import { exampleLists } from "../src/lib/data/exampleLists";

async function populateExampleLists() {
  console.log("Starting to populate example lists...");
  console.log(`Found ${exampleLists.length} example lists to populate`);

  for (const list of exampleLists) {
    try {
      console.log(`Populating list: ${list.name}`);

      // Check if list already exists
      const { data: existing } = await supabaseAdmin
        .from("lists")
        .select("id")
        .eq("id", list.id)
        .single();

      if (existing) {
        console.log(`  Skipping (already exists): ${list.name}`);
        continue;
      }

      // Insert list
      const { error: listError } = await supabaseAdmin.from("lists").insert({
        id: list.id,
        user_id: null, // NULL for example lists
        name: list.name,
        description: null,
        is_public: true,
        default_direction: list.defaultDirection || "front-to-back",
        is_example: true,
        is_test_data: false,
        created_at: list.createdAt.toISOString(),
        updated_at: list.updatedAt.toISOString(),
      });

      if (listError) throw listError;

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

      console.log(`✓ Successfully populated: ${list.name} (${list.cards.length} cards)`);
    } catch (error) {
      console.error(`✗ Failed to populate list "${list.name}":`, error);
    }
  }

  console.log("\nDone populating example lists!");
}

// Run the script
populateExampleLists()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
  });
