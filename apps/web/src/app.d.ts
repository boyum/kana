// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      supabase: import("@supabase/ssr").SupabaseClient;
      safeGetSession: () => Promise<{
        session: import("@supabase/supabase-js").Session | null;
        user: import("@supabase/supabase-js").User | null;
      }>;
      user: import("$lib/server/auth").SessionValidationResult["user"];
      session: import("$lib/server/auth").SessionValidationResult["session"];
    }
  } // interface Error {}
  // interface Locals {}
} // interface PageData {}
// interface PageState {}

// interface Platform {}
export {};
