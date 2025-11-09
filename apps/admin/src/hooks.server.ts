import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { AuthService } from '@kana/db-services';

const supabaseHandle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: cookiesToSet => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' });
          });
        },
      },
    }
  );

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
      return { session: null, user: null };
    }

    return { session, user };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    },
  });
};

/**
 * Admin authentication guard
 * All routes in admin app require admin role
 */
const adminGuardHandle: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Allow login page without authentication
  if (event.url.pathname === '/login') {
    // If already authenticated and admin, redirect to dashboard
    if (session && user) {
      const authService = new AuthService(event.locals.supabase);
      const isAdmin = await authService.isAdmin(user.id);

      if (isAdmin) {
        redirect(303, '/');
      }
    }
    return resolve(event);
  }

  // All other routes require authentication
  if (!session || !user) {
    redirect(303, '/login');
  }

  // Check admin role
  const authService = new AuthService(event.locals.supabase);
  const isAdmin = await authService.isAdmin(user.id);

  if (!isAdmin) {
    // Not an admin, show unauthorized page
    redirect(303, '/unauthorized');
  }

  event.locals.isAdmin = true;

  return resolve(event);
};

export const handle: Handle = sequence(supabaseHandle, adminGuardHandle);
