# Kana Admin

Admin dashboard for managing Kana custom lists.

## Features

- View all custom lists with filtering (all, public, example, user-created)
- Search lists by name or description
- Promote/unpromote lists to example status
- Publish/unpublish lists (make them public or private)
- Delete any list
- Admin-only access with role-based authentication

## Development

```bash
# Install dependencies (from root)
npm install

# Build shared packages first
npm run build --workspace=@kana/db-services

# Run dev server
npm run dev --workspace=@kana/admin
```

The admin app will be available at http://localhost:5174

## Environment Variables

Create a `.env.local` file in the admin app directory or use the shared `.env.development.local` at the root:

```env
SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Setting up an Admin User

After running the database migrations, use the script to set a user as admin:

```bash
npx tsx apps/admin/../web/scripts/set-admin.ts your-email@example.com
```

Or use a user ID directly:

```bash
npx tsx apps/admin/../web/scripts/set-admin.ts user-id-here
```

## Architecture

The admin app is a separate SvelteKit application that:

1. Uses the shared `@kana/db-services` package for database operations
2. Requires admin role for all routes (except login)
3. Uses GitHub OAuth for authentication
4. Communicates with Supabase using the service role key for admin operations

## Deployment

The admin app is configured to deploy to Vercel (like the main web app). Make sure to:

1. Set the appropriate environment variables in Vercel
2. Configure the project to deploy from the `apps/admin` directory
3. Restrict access to the admin domain appropriately
