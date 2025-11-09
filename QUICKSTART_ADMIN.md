# Quick Start: Admin UI

Get the admin dashboard up and running in 5 minutes.

## Prerequisites

- Supabase project set up
- Environment variables configured
- At least one user account created

## Step-by-Step Setup

### 1. Enable GitHub OAuth

⚠️ **Critical first step** or you'll get "provider is not enabled" error!

1. Go to https://supabase.com/dashboard → Your Project
2. Click Authentication → Providers
3. Enable GitHub
4. Create OAuth app at https://github.com/settings/developers
5. Add Client ID and Secret to Supabase

📖 **Full guide**: [SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md)

### 2. Run Database Migrations

```bash
cd apps/web
npx supabase db reset
# Or if you prefer individual migrations:
# npx supabase migration up
```

This creates the admin role system and RLS policies.

### 2. Build Shared Package

```bash
npm run build --workspace=@kana/db-services
```

### 3. Sign In and Create Your Account

1. Start the web app: `npm run dev --workspace=@kana/web`
2. Go to http://localhost:5173/login
3. Sign in with GitHub
4. This creates your user account in Supabase

### 4. Set Yourself as Admin

Now assign admin role to your account:

```bash
npx tsx apps/web/scripts/set-admin.ts your-email@example.com
```

You should see:
```
✅ Found user: your-email@example.com (ID: xxx-xxx-xxx)
✅ Successfully set user as admin!
```

### 5. Start the Admin App

```bash
npm run dev --workspace=@kana/admin
```

### 6. Access the Dashboard

1. Open http://localhost:5174
2. Click "Sign in with GitHub"
3. You'll be redirected to the admin dashboard

## What You Can Do

### View Lists
- Filter by: All, Example, Public, or User lists
- Search by name or description

### Manage Lists
- **⭐ Promote**: Make a user list an official example
- **✖ Unpromote**: Remove example status
- **🌐 Publish**: Make a list publicly visible
- **🔒 Unpublish**: Make a list private
- **🗑️ Delete**: Permanently remove a list

## Testing Checklist

- [ ] Can sign in with GitHub
- [ ] Dashboard loads and shows lists
- [ ] Filters work (All, Example, Public, User)
- [ ] Search works
- [ ] Can promote a list to example
- [ ] Can unpromote an example list
- [ ] Can publish a private list
- [ ] Can unpublish a public list
- [ ] Can delete a list (with confirmation)
- [ ] Non-admin users see "Unauthorized" page

## Common Issues

### "Unauthorized" Page

**Problem**: You see the unauthorized page after signing in.

**Solution**:
```bash
# Check your user ID
npx tsx apps/web/scripts/set-admin.ts your-email@example.com

# Verify in database
# In Supabase dashboard, run:
# SELECT * FROM profiles WHERE role = 'admin';
```

### "Failed to fetch lists"

**Problem**: Dashboard loads but lists don't appear.

**Solutions**:
1. Check environment variables are set
2. Verify service role key is correct
3. Check browser console for errors
4. Ensure migrations have run

### Import Errors

**Problem**: TypeScript errors about `@kana/db-services`.

**Solution**:
```bash
npm run build --workspace=@kana/db-services
npm install
```

## Next Steps

1. Read the full [ADMIN_SETUP.md](./ADMIN_SETUP.md) guide
2. Review security best practices
3. Set up production deployment
4. Configure additional admin users

## Development Workflow

```bash
# Terminal 1: Web app
npm run dev --workspace=@kana/web

# Terminal 2: Admin app
npm run dev --workspace=@kana/admin

# Terminal 3: Watch shared package (if editing)
npm run dev --workspace=@kana/db-services
```

## Quick Commands Reference

```bash
# Set user as admin
npx tsx apps/web/scripts/set-admin.ts <email-or-id>

# Build shared services
npm run build --workspace=@kana/db-services

# Run admin app
npm run dev --workspace=@kana/admin

# Check TypeScript
npm run check --workspace=@kana/admin

# Build for production
npm run build --workspace=@kana/admin
```

## Architecture at a Glance

```
┌─────────────────┐
│   Web App       │ ← Users
│  (Port 5173)    │
└─────────────────┘
         │
         ↓
┌─────────────────┐
│   Supabase      │ ← Database
│   (Cloud/Local) │
└─────────────────┘
         ↑
         │
┌─────────────────┐
│   Admin App     │ ← Admins
│  (Port 5174)    │
└─────────────────┘
         │
         ↓
┌─────────────────┐
│  @kana/db-      │ ← Shared
│   services      │   Logic
└─────────────────┘
```

Both apps use the same database but admin app has elevated privileges via service role key.

## Support

For detailed information, see:
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Complete setup guide
- [apps/admin/README.md](./apps/admin/README.md) - Admin app details
- [packages/db-services/README.md](./packages/db-services/README.md) - API docs
