import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * Auth callback handler for OAuth flows
 * Supabase redirects here after successful OAuth authentication
 */
export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    // The session is automatically set by Supabase client
    // No need to manually exchange the code
    redirect(303, next);
  }

  // If no code, redirect to home
  redirect(303, "/");
};
