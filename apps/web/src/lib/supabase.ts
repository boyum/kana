import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
	throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase client for browser usage
 * Uses the anonymous key which is safe to expose in the browser
 */
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
	},
});

/**
 * Type-safe database client
 * Add your Database type here for full type safety:
 *
 * import type { Database } from '$lib/types/database.types';
 * export const supabase = createClient<Database>(...);
 */
export type SupabaseClient = typeof supabase;
