# Authentication Setup Guide

This guide explains how to set up authentication for the Kana application with GitHub OAuth and guest accounts.

## Features

- **GitHub OAuth**: Users can sign in with their GitHub account
- **Guest Accounts**: Users can use the app without registration (data stored locally)
- **Anonymous Sign-in**: Powered by Supabase anonymous authentication
- **Account Linking**: Guests can upgrade to registered accounts by linking GitHub

## Setup Instructions

### 1. GitHub OAuth Application

First, create a GitHub OAuth application:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Kana (or your preferred name)
   - **Homepage URL**:
     - Local: `http://127.0.0.1:3000`
     - Production: `https://your-domain.com`
   - **Authorization callback URL**:
     - Local: `http://127.0.0.1:54321/auth/v1/callback`
     - Production: `https://your-project-id.supabase.co/auth/v1/callback`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### 2. Configure Local Environment

For local development, add your GitHub credentials to `.env.local`:

```bash
# Supabase Local Development (already configured)
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GitHub OAuth Configuration (add these)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Start Supabase

Start your local Supabase instance:

```bash
npm run supabase:start
```

This will:

- Start the Supabase services (API, DB, Auth, Studio)
- Apply the database migrations (including profiles and lists tables)
- Enable GitHub authentication (configured in `supabase/config.toml`)

### 4. Verify Configuration

1. Open Supabase Studio: `npm run supabase:studio`
2. Navigate to Authentication → Providers
3. Verify that GitHub is enabled
4. Check that Anonymous sign-ins are enabled

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://127.0.0.1:3000` and you should see the login page with options to:

- Sign in with GitHub
- Continue as Guest

## Production Setup

### 1. Deploy to Supabase Cloud

1. Create a project at [supabase.com](https://supabase.com)
2. Get your project's API keys from Settings → API
3. Configure GitHub OAuth in Authentication → Providers
4. Add your production domain to the allowed redirect URLs

### 2. Configure Environment Variables

Create a `.env` file for production (never commit this):

```bash
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Deploy Migrations

Push your database schema to production:

```bash
supabase link --project-ref your-project-id
supabase db push
```

## Architecture

### Authentication Flow

#### GitHub OAuth Flow

1. User clicks "Continue with GitHub"
2. Redirected to GitHub authorization page
3. User authorizes the app
4. GitHub redirects back to `/auth/callback` with auth code
5. Supabase exchanges code for session
6. User is redirected to the app (or original destination)

#### Guest Flow

1. User clicks "Continue as Guest"
2. App creates an anonymous session via Supabase
3. User data stored locally in browser
4. Can later upgrade to permanent account

### Key Files

```
apps/web/
├── src/
│   ├── lib/
│   │   ├── stores/
│   │   │   └── auth.svelte.ts         # Auth state management (Svelte 5 runes)
│   │   ├── components/
│   │   │   └── UserMenu.svelte        # User dropdown menu
│   │   ├── supabase.ts                # Browser Supabase client
│   │   └── supabase.server.ts         # Server Supabase client
│   ├── routes/
│   │   ├── +layout.svelte             # Root layout with header
│   │   ├── +layout.server.ts          # Server layout (session data)
│   │   ├── login/
│   │   │   ├── +page.svelte           # Login page UI
│   │   │   └── +page.ts               # Login page data (redirect param)
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── +server.ts         # OAuth callback handler
│   │   └── logout/
│   │       └── +server.ts             # Logout endpoint
│   ├── hooks.server.ts                # Auth middleware & session management
│   └── app.d.ts                       # TypeScript types for locals
├── supabase/
│   ├── config.toml                    # Supabase config (GitHub enabled)
│   └── migrations/
│       └── 20250109000000_initial_schema.sql  # DB schema
└── .env.local                         # Local environment variables
```

### Auth Store API

The auth store (`$lib/stores/auth.svelte.ts`) provides:

```typescript
// State (reactive with Svelte 5 runes)
authStore.user; // Current user or null
authStore.session; // Current session or null
authStore.isGuest; // Boolean: is user a guest?
authStore.loading; // Boolean: is auth loading?

// Computed properties
authStore.isAuthenticated; // Boolean: is user logged in (guest or registered)?
authStore.isRegistered; // Boolean: is user a registered (non-guest) user?

// Methods
authStore.signInWithGitHub(); // Sign in with GitHub OAuth
authStore.continueAsGuest(); // Create guest account
authStore.linkGitHubAccount(); // Link GitHub to guest account
authStore.signOut(); // Sign out
```

### Protected Routes

Routes that require authentication are protected in `src/hooks.server.ts`:

```typescript
const protectedRoutes = ["/egendefinert/new", "/egendefinert/[listId]/edit"];
```

Unauthenticated users are redirected to `/login?redirectTo=<original-url>`.

## Usage in Components

### Check Authentication Status

```svelte
<script>
  import { authStore } from '$lib/stores/auth.svelte';
</script>

{#if authStore.isAuthenticated}
  <p>Welcome, {authStore.user?.email}!</p>
{:else}
  <a href="/login">Sign In</a>
{/if}

{#if authStore.isGuest}
  <button onclick={() => authStore.linkGitHubAccount()}>
    Upgrade to Full Account
  </button>
{/if}
```

### Server-Side Data Loading

```typescript
// +page.server.ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) {
    redirect(303, "/login");
  }

  // Fetch user-specific data
  const { data } = await locals.supabase
    .from("lists")
    .select("*")
    .eq("user_id", locals.user.id);

  return { lists: data };
};
```

## Guest vs Registered Users

| Feature                   | Guest                      | Registered     |
| ------------------------- | -------------------------- | -------------- |
| Custom lists              | ✓ (local only)             | ✓ (cloud sync) |
| Learning progress         | ✓ (local only)             | ✓ (cloud sync) |
| Access from other devices | ✗                          | ✓              |
| Share lists publicly      | ✗                          | ✓              |
| Account persistence       | Until browser data cleared | Permanent      |

## Troubleshooting

### GitHub OAuth Not Working

1. Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
2. Verify callback URL matches exactly: `http://127.0.0.1:54321/auth/v1/callback`
3. Restart Supabase: `npm run supabase:stop && npm run supabase:start`

### Anonymous Sign-in Failing

1. Check `supabase/config.toml` has `enable_anonymous_sign_ins = true`
2. Restart Supabase after config changes

### Session Not Persisting

1. Check browser cookies are enabled
2. Verify `persistSession: true` in `supabase.ts`
3. Check that `hooks.server.ts` is properly setting cookies

### Type Errors

Run type generation:

```bash
npm run supabase:types
```

## Security Notes

- **Never commit** production `.env` files
- The **service role key** bypasses RLS - only use server-side
- **Anonymous key** is safe for browser use (respects RLS)
- GitHub secrets should be environment variables, not hardcoded
- Row Level Security (RLS) is enabled on all tables

## Next Steps

- [ ] Add email/password authentication (optional)
- [ ] Implement password reset flow
- [ ] Add profile editing page
- [ ] Set up email confirmations for production
- [ ] Configure rate limiting for production
- [ ] Add social login providers (Google, Discord, etc.)
