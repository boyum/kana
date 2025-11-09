import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";
import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const supabaseHandle: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: cookiesToSet => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    },
  );

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return { session: null, user: null };
    }

    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      // JWT validation has failed
      return { session: null, user: null };
    }

    return { session, user };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};

/**
 * Auth guard to protect routes that require authentication
 */
const authGuardHandle: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Protected routes that require authentication
  const protectedRoutes = ["/egendefinert/new", "/egendefinert/[listId]/edit"];

  // Check if the current route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => {
    const routePattern = new RegExp(
      "^" + route.replace(/\[[\w]+\]/g, "[^/]+") + "$",
    );
    return routePattern.test(event.url.pathname);
  });

  // Redirect to login if accessing a protected route without authentication
  if (isProtectedRoute && !session) {
    const redirectTo = event.url.pathname + event.url.search;
    redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return resolve(event);
};

export const handle: Handle = sequence(supabaseHandle, authGuardHandle);
