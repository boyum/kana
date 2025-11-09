# Supabase Setup & Development Guide

This project uses Supabase for the database and authentication. This guide shows you how to develop locally **without Docker** for the best developer experience.

## Quick Start (No Docker Required!)

### 1. Install Supabase CLI

The Supabase CLI is already installed as a dev dependency. You can also install it globally:

```bash
# macOS (using Homebrew)
brew install supabase/tap/supabase

# Or use the project-local version (already installed)
npx supabase --version
```

### 2. Start Local Development

Start the local Supabase instance:

```bash
npm run supabase:start
```

This will:

- Start a local Postgres database (requires Docker - see Docker-free alternative below)
- Run all migrations
- Start the Studio UI at http://127.0.0.1:54323
- Provide you with local API keys

**First time?** This may take a few minutes to download Docker images.

### 3. Check Status

```bash
npm run supabase:status
```

This shows all running services and their URLs/keys.

### 4. Start Your App

```bash
npm run dev
```

Your app will automatically connect to the local Supabase instance using the credentials in [.env.local](.env.local).

## Docker-Free Development (Alternative)

If you prefer not to use Docker, you can:

### Option 1: Use Supabase Cloud Free Tier

1. Create a free project at https://supabase.com/dashboard
2. Get your credentials from Project Settings → API
3. Update [.env](.env) with your production credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Option 2: Local Postgres (Advanced)

If you have Postgres installed locally:

1. Create a database: `createdb kana_dev`
2. Run migrations manually:
   ```bash
   psql kana_dev < supabase/migrations/20250109000000_initial_schema.sql
   ```
3. Configure your app to connect directly to Postgres (you'll lose some Supabase features like Auth and Storage)

## Development Workflow

### Creating Migrations

Migrations are version-controlled SQL files that define your database schema.

#### Manual Migration

Create a new file in `supabase/migrations/`:

```bash
# File: supabase/migrations/20250109120000_add_tags.sql
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);
```

#### Auto-generate Migration from Changes

If you make changes in Supabase Studio:

```bash
npx supabase db diff -f add_tags
```

This creates a migration file with your changes.

### Applying Migrations

Migrations are automatically applied when you start Supabase. To manually apply:

```bash
npm run supabase:reset  # Resets DB and runs all migrations + seeds
```

### Seeding Data

Edit [supabase/seed.sql](supabase/seed.sql) to add test data. Seeds run automatically on `db reset`.

### Generating TypeScript Types

After creating/modifying tables, generate types:

```bash
npm run supabase:types
```

This creates [src/lib/types/database.types.ts](src/lib/types/database.types.ts) with full type safety.

Use it like:

```typescript
import type { Database } from "$lib/types/database.types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient<Database>(url, key);

// Now you get full autocomplete!
const { data } = await supabase.from("lists").select("*").single();
```

## Using Supabase in Your Code

### Client-side (Browser)

```typescript
// src/routes/+page.svelte
import { supabase } from "$lib/supabase";

// Query data
const { data, error } = await supabase
  .from("lists")
  .select("*")
  .eq("is_public", true);

// Real-time subscriptions
supabase
  .channel("lists")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "lists",
    },
    payload => {
      console.log("Change received!", payload);
    },
  )
  .subscribe();
```

### Server-side (With User Context)

```typescript
// src/routes/api/lists/+server.ts
import { supabaseAdmin } from "$lib/supabase.server";

export async function GET({ request }) {
  // Using admin client (bypasses RLS)
  const { data } = await supabaseAdmin.from("lists").select("*");

  return json(data);
}
```

### Server-side (With RLS)

For operations that should respect Row Level Security:

```typescript
import { createServerClient } from "$lib/supabase.server";

export async function GET({ cookies }) {
  const token = cookies.get("access_token");
  const refresh = cookies.get("refresh_token");

  const supabase = createServerClient(token, refresh);

  // This respects RLS policies
  const { data } = await supabase.from("lists").select("*");
}
```

## Supabase Studio

Access the local Supabase Studio at http://127.0.0.1:54323

Features:

- Table Editor: View and edit data
- SQL Editor: Run queries
- Database: View schema
- Auth: Manage test users
- Storage: Manage files

## Common Commands

```bash
# Start local Supabase
npm run supabase:start

# Stop local Supabase
npm run supabase:stop

# Reset database (runs migrations + seeds)
npm run supabase:reset

# Check status and get credentials
npm run supabase:status

# Open Studio UI
npm run supabase:studio

# Generate TypeScript types
npm run supabase:types
```

## Team Development

### Version Control

All of these are version controlled (commit them):

- `supabase/config.toml` - Supabase configuration
- `supabase/migrations/*.sql` - Database schema
- `supabase/seed.sql` - Test data
- `.env.local` - Local development credentials (safe defaults)

Do NOT commit:

- `.env` - Production credentials
- `supabase/.temp/` - Temporary files (already gitignored)

### Onboarding New Developers

New developers just need to:

1. Clone the repo
2. Run `npm install`
3. Run `npm run supabase:start`
4. Run `npm run dev`

That's it! All migrations and seeds apply automatically.

## Offline Development

Supabase local development works completely offline once the Docker images are downloaded. All data is stored locally.

No internet connection required for:

- Database operations
- Auth (local auth server)
- Storage (local files)
- Realtime (local broadcaster)

## Troubleshooting

### "Cannot connect to Docker"

If you don't have Docker installed:

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Or use the cloud option (see Docker-Free Development above)

### "Port already in use"

If ports 54321-54327 are in use:

```bash
# Stop Supabase
npm run supabase:stop

# Or change ports in supabase/config.toml
```

### "Migration failed"

```bash
# Reset the database
npm run supabase:reset

# If that fails, stop and start fresh
npm run supabase:stop
npm run supabase:start
```

### Type errors after schema changes

```bash
# Regenerate types
npm run supabase:types

# Restart your dev server
npm run dev
```

## Production Deployment

### Deploy to Supabase Cloud

1. Create a project at https://supabase.com/dashboard
2. Link your local project:
   ```bash
   npx supabase link --project-ref your-project-ref
   ```
3. Push migrations:
   ```bash
   npx supabase db push
   ```
4. Update [.env](.env) with production credentials

### Deploy to Vercel

Your app is already configured for Vercel with `@sveltejs/adapter-vercel`.

Set environment variables in Vercel:

- `SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Local Development Guide](https://supabase.com/docs/guides/local-development)
- [SvelteKit + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
