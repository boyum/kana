#!/usr/bin/env tsx
// Script to test database connection and operations
import { supabaseAdmin } from "./supabase-client";
import { randomUUID } from "crypto";

const TEST_USER_ID = null; // NULL for test data

async function testDbConnection() {
  console.log("Testing Supabase connection...");

  try {
    // Test 1: Check if we can connect to the database
    const { data, error } = await supabaseAdmin.from("lists").select("count");

    if (error) {
      console.error("✗ Failed to connect to database:", error);
      return false;
    }

    console.log("✓ Successfully connected to database");

    // Test 2: Create a test list
    console.log("\nTest 2: Creating a test list...");
    const testListId = randomUUID();
    const card1Id = randomUUID();
    const card2Id = randomUUID();
    const now = new Date().toISOString();

    const { error: listError } = await supabaseAdmin.from("lists").insert({
      id: testListId,
      user_id: TEST_USER_ID,
      name: "Test List - " + new Date().toISOString(),
      description: null,
      is_public: false,
      default_direction: "front-to-back",
      is_example: false,
      is_test_data: true,
      created_at: now,
      updated_at: now,
    });

    if (listError) {
      console.error("✗ Failed to create list:", listError);
      return false;
    }

    const { error: cardsError } = await supabaseAdmin.from("cards").insert([
      {
        id: card1Id,
        list_id: testListId,
        front: "Test Front 1",
        back: "Test Back 1",
        notes: "This is a test card",
        tags: ["test"],
        created_at: now,
        updated_at: now,
      },
      {
        id: card2Id,
        list_id: testListId,
        front: "Test Front 2",
        back: "Test Back 2",
        created_at: now,
        updated_at: now,
      },
    ]);

    if (cardsError) {
      console.error("✗ Failed to create cards:", cardsError);
      return false;
    }

    console.log("✓ Successfully created test list with 2 cards");

    // Test 3: Read the list back
    console.log("\nTest 3: Reading lists from database...");
    const { data: lists, error: readError } = await supabaseAdmin
      .from("lists")
      .select("*, cards(*)")
      .is("user_id", null)
      .eq("is_test_data", true);

    if (readError) {
      console.error("✗ Failed to read lists:", readError);
      return false;
    }

    console.log(`✓ Successfully read ${lists?.length || 0} list(s)`);

    if (lists && lists.length > 0) {
      const firstList = lists[0];
      console.log(`  - List name: ${firstList.name}`);
      console.log(`  - Cards count: ${firstList.cards?.length || 0}`);
    }

    // Test 4: Delete test list
    console.log("\nTest 4: Deleting test list...");
    const { error: deleteError } = await supabaseAdmin
      .from("lists")
      .delete()
      .eq("id", testListId);

    if (deleteError) {
      console.error("✗ Failed to delete list:", deleteError);
      return false;
    }

    console.log("✓ Successfully deleted test list");

    // Verify deletion
    const { data: listsAfterDelete } = await supabaseAdmin
      .from("lists")
      .select("id")
      .eq("id", testListId);

    if (!listsAfterDelete || listsAfterDelete.length === 0) {
      console.log("✓ Verified list was deleted");
    } else {
      console.error("✗ List still exists after deletion");
      return false;
    }

    console.log("\n✓ All tests passed!");
    return true;
  } catch (error) {
    console.error("✗ Test failed:", error);
    return false;
  }
}

// Run the script
testDbConnection()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
  });
