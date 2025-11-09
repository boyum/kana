# Admin UI Setup Guide

This guide explains how to set up and use the admin UI for managing public custom lists in Kana.

## Architecture Overview

The admin functionality is split into three parts:

1. **Shared Database Services** (`packages/db-services`)
   - Shared TypeScript services for database operations
   - Used by both web and admin applications
   - Provides type-safe interfaces for lists and authentication

2. **Database Schema** (`apps/web/supabase/migrations`)
   - Admin role system with user profiles
   - Row Level Security (RLS) policies for admin access
   - Lists and cards tables with public/example flags

3. **Admin Application** (`apps/admin`)
   - Separate SvelteKit application for admin dashboard
   - GitHub OAuth authentication
   - Full list management UI

## Setup Instructions

### 1. Run Database Migrations

Apply the new admin role migration:

```bash
cd apps/web
npx supabase db reset  # Or use migration commands
```

This will create:
- `profiles` table with `role` field (user | admin)
- Admin RLS policies for lists and cards
- Helper functions for admin checks

### 2. Configure GitHub OAuth

Enable GitHub authentication in Supabase:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable GitHub provider
3. Create GitHub OAuth app at https://github.com/settings/developers
4. Add Client ID and Secret to Supabase

**Detailed instructions**: See [SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md)

**Note**: This step is required or you'll get "provider is not enabled" error.

### 3. Set Up an Admin User

After GitHub OAuth is working, sign in once to create your user account, then assign admin role:

```bash
# Using email
npx tsx apps/web/scripts/set-admin.ts your-email@example.com

# Or using user ID
npx tsx apps/web/scripts/set-admin.ts your-user-id-here
```

### 4. Configure Environment Variables

The admin app needs the same environment variables as the web app. You can either:

**Option A: Use shared environment file (recommended)**

The admin app will read from the root `.env.development.local` file:

```env
SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Option B: Create separate admin .env.local**

Create `apps/admin/.env.local`:

```env
SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Build Shared Packages

Build the db-services package before running the admin app:

```bash
npm run build --workspace=@kana/db-services
```

### 6. Run the Admin App

Start the admin development server:

```bash
npm run dev --workspace=@kana/admin
```

The admin dashboard will be available at: http://localhost:5174

## Using the Admin Dashboard

### Authentication

1. Navigate to http://localhost:5174
2. Sign in with GitHub
3. If you don't have admin role, you'll see an "Unauthorized" page
4. Contact system admin to assign admin role

### Managing Lists

The admin dashboard provides:

#### Filtering
- **All Lists**: View every list in the system
- **Example Lists**: Lists marked as examples (shown to all users)
- **Public Lists**: User-created lists that are publicly visible
- **User Lists**: Private user-created lists

#### Search
- Search by list name or description
- Real-time filtering

#### Actions

For each list, you can:

1. **Promote to Example** (⭐)
   - Makes the list an "example" list
   - Automatically makes it public
   - Shows in example list section for all users

2. **Remove Example Status** (✖)
   - Removes example flag
   - List remains public unless unpublished

3. **Make Public** (🌐)
   - Makes a private list publicly visible
   - Other users can view and duplicate it

4. **Make Private** (🔒)
   - Makes a public list private
   - Only owner can see it

5. **Delete** (🗑️)
   - Permanently deletes the list
   - Also deletes all associated cards (CASCADE)
   - Cannot be undone

### Best Practices

1. **Example Lists**
   - Use for curated, high-quality lists
   - Promote well-designed user lists to examples
   - Review before promoting

2. **Public vs Private**
   - Public: Visible to all users, can be duplicated
   - Private: Only visible to owner
   - Example lists should always be public

3. **Deletion**
   - Use sparingly
   - Consider unpublishing instead
   - No recovery after deletion

## Deployment

### Development

```bash
# Terminal 1: Run web app
npm run dev --workspace=@kana/web

# Terminal 2: Run admin app
npm run dev --workspace=@kana/admin
```

### Production (Vercel)

The admin app should be deployed separately from the main web app:

1. **Create separate Vercel project**
   - Connect to your repo
   - Set root directory to `apps/admin`
   - Framework: SvelteKit

2. **Environment Variables**
   - Set all required Supabase variables
   - Use same database as web app
   - Enable service role key

3. **Domain & Access Control**
   - Use subdomain: `admin.yourdomain.com`
   - Consider IP whitelisting or additional auth
   - Admin role checked on every request

## Security Considerations

### Authentication Flow

1. User signs in with GitHub OAuth
2. Session validated on every request
3. Admin role checked from profiles table
4. Non-admins redirected to unauthorized page

### Authorization

- All admin routes protected by middleware
- RLS policies enforce database-level security
- Service role key only used server-side
- Admin checks on both client and server

### Best Practices

1. **Limit Admin Accounts**
   - Only assign admin role to trusted users
   - Regularly audit admin list

2. **Monitor Actions**
   - Consider adding audit logging
   - Track who changed what and when

3. **Secure Credentials**
   - Never commit service role key
   - Use environment variables
   - Rotate keys periodically

4. **Network Security**
   - Consider VPN requirement for admin access
   - Use IP whitelisting if possible
   - Enable MFA on admin accounts

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id text PRIMARY KEY REFERENCES auth.users(id),
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### Lists Table (Updated)

```sql
CREATE TABLE lists (
  id text PRIMARY KEY,
  user_id text REFERENCES auth.users(id),  -- NULL for system lists
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  is_example boolean DEFAULT false,         -- NEW
  is_test_data boolean DEFAULT false,
  default_direction text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Key RLS Policies

```sql
-- Admins can do everything
CREATE POLICY "Admins can view all lists"
  ON lists FOR SELECT
  USING (is_admin(auth.uid()::text));

CREATE POLICY "Admins can update any list"
  ON lists FOR UPDATE
  USING (is_admin(auth.uid()::text));

-- Similar policies for INSERT and DELETE
```

## Troubleshooting

### "Unauthorized" after signing in

- Check if admin role is set: `SELECT * FROM profiles WHERE id = 'your-user-id'`
- Run set-admin script again
- Verify user ID matches authenticated user

### "Failed to fetch lists"

- Check Supabase connection
- Verify service role key is set
- Check browser console for errors
- Ensure migrations have been applied

### "Admin access required" errors

- Session may have expired, sign in again
- Admin role might have been removed
- Check server logs for details

### Build errors in admin app

- Make sure db-services package is built first
- Run `npm install` again
- Clear `.svelte-kit` directory and rebuild

## API Reference

The admin app uses these API endpoints:

- `GET /api/lists?filter=<type>&search=<query>` - Get all lists
- `DELETE /api/lists/[id]` - Delete a list
- `PATCH /api/lists/[id]` - Update list properties
- `POST /api/lists/[id]/publish` - Make list public
- `POST /api/lists/[id]/unpublish` - Make list private
- `POST /api/lists/[id]/promote` - Promote to example
- `POST /api/lists/[id]/unpromote` - Remove example status

All endpoints require admin authentication.

## Shared Services

The `@kana/db-services` package provides:

### ListsService

```typescript
class ListsService {
  getAllLists(options?: FilterOptions): Promise<ListWithCardCount[]>
  getList(id: string): Promise<DbList | null>
  updateList(id: string, updates: ListUpdateFields): Promise<DbList>
  deleteList(id: string): Promise<void>
  publishList(id: string): Promise<DbList>
  unpublishList(id: string): Promise<DbList>
  promoteToExample(id: string): Promise<DbList>
  unpromoteFromExample(id: string): Promise<DbList>
}
```

### AuthService

```typescript
class AuthService {
  isAdmin(userId: string): Promise<boolean>
  getProfile(userId: string): Promise<DbProfile | null>
  setUserRole(userId: string, role: 'user' | 'admin'): Promise<DbProfile>
}
```

## Future Enhancements

Potential improvements:

1. **Audit Logging**
   - Track all admin actions
   - Show who made changes and when

2. **Bulk Operations**
   - Select multiple lists
   - Bulk promote/unpromote/delete

3. **User Management**
   - View all users
   - Manage user roles
   - Ban/suspend users

4. **Analytics**
   - Most popular lists
   - Usage statistics
   - User activity

5. **List Editing**
   - Edit list details directly in admin UI
   - Add/remove cards
   - Reorder cards

6. **Moderation Queue**
   - Review reported lists
   - Approve user-submitted example lists
   - Content moderation tools
