import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

if (!PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase client for server-side usage with elevated privileges
 * This bypasses Row Level Security (RLS) - use with caution!
 * Only use this in server-side code (e.g., +page.server.ts, +server.ts)
 */
export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		persistSession: false,
		autoRefreshToken: false,
	},
});

/**
 * Creates a Supabase client with a user's session for server-side rendering
 * Use this for authenticated server-side operations that respect RLS
 */
export function createServerClient(accessToken: string, refreshToken: string) {
	return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			persistSession: false,
		},
		global: {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},
	});
}
