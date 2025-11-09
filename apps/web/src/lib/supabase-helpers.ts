/**
 * Supabase Helper Functions
 * Common patterns and utilities for working with Supabase
 */
import type { SupabaseClient } from "./supabase";

/**
 * Type-safe error handler for Supabase queries
 */
export function handleSupabaseError(error: any): never {
  console.error("Supabase error:", error);
  throw new Error(error.message || "Database operation failed");
}

/**
 * Safely get a single row or throw if not found
 */
export async function getSingleOrThrow<T>(
  query: Promise<{ data: T | null; error: any }>,
): Promise<T> {
  const { data, error } = await query;

  if (error) {
    handleSupabaseError(error);
  }

  if (!data) {
    throw new Error("Not found");
  }

  return data;
}

/**
 * Get current user or throw if not authenticated
 */
export async function requireAuth(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(
  supabase: SupabaseClient,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}

/**
 * Paginate query results
 */
export function paginate<T>(
  query: any,
  page: number = 1,
  pageSize: number = 10,
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return query.range(from, to);
}

/**
 * Example usage:
 *
 * // In a component
 * import { supabase } from '$lib/supabase';
 * import { getSingleOrThrow, requireAuth } from '$lib/supabase-helpers';
 *
 * // Get a single list
 * const list = await getSingleOrThrow(
 *   supabase.from('lists').select('*').eq('id', listId).single()
 * );
 *
 * // Require authentication
 * const user = await requireAuth(supabase);
 *
 * // Paginated results
 * const { data } = await paginate(
 *   supabase.from('lists').select('*'),
 *   page,
 *   10
 * );
 */
