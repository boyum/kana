# Vercel Secrets Management

This guide explains how to manage environment variables and secrets using Vercel.

## Overview

Kana uses Vercel for:
- Hosting both web and admin applications
- Managing environment variables
- Securing sensitive credentials

## Environment Variables

### Required Variables

Both applications need these Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note**:
- `PUBLIC_*` variables are exposed to the browser
- Non-prefixed variables are server-side only

## Setting Up Vercel Secrets

### Option 1: Vercel Dashboard (Recommended)

1. **Go to your project settings**
   - Navigate to https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables

2. **Add environment variables**
   - Click "Add New"
   - Enter variable name and value
   - Select environments (Production, Preview, Development)
   - Click "Save"

3. **Required variables for Web App**:
   ```
   SUPABASE_URL               → All environments
   PUBLIC_SUPABASE_URL        → All environments
   PUBLIC_SUPABASE_ANON_KEY   → All environments
   SUPABASE_SERVICE_ROLE_KEY  → Production only (optional for Preview)
   ```

4. **Required variables for Admin App**:
   ```
   SUPABASE_URL               → All environments
   PUBLIC_SUPABASE_URL        → All environments
   PUBLIC_SUPABASE_ANON_KEY   → All environments
   SUPABASE_SERVICE_ROLE_KEY  → All environments (required)
   ```

### Option 2: Vercel CLI

Install the Vercel CLI:

```bash
npm i -g vercel
```

Login to Vercel:

```bash
vercel login
```

Link your project:

```bash
vercel link
```

Add environment variables:

```bash
# Add production secret
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Add to all environments
vercel env add PUBLIC_SUPABASE_URL

# Pull environment variables for local development
vercel env pull .env.local
```

## Local Development

### Setup .env.local

Create `.env.development.local` in the root:

```bash
cp .env.example .env.development.local
```

Fill in your values:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optional: Supabase Local Development
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=your-jwt-secret
```

**Important**: Never commit `.env.development.local` to git!

### For Admin App Only

You can also create `apps/admin/.env.local` with the same variables if you want to keep admin config separate.

## Security Best Practices

### 1. Service Role Key Protection

⚠️ **Never expose the service role key to the client!**

- Only use in server-side code (`*.server.ts` files)
- Import from `$env/static/private`
- Never log or expose in error messages

### 2. Environment-Specific Secrets

Use different keys for different environments:

- **Production**: Real credentials with full permissions
- **Preview**: Staging credentials with limited permissions
- **Development**: Local Supabase or development credentials

### 3. Rotate Secrets Regularly

Update your secrets periodically:

1. Generate new keys in Supabase dashboard
2. Update in Vercel dashboard
3. Redeploy applications
4. Verify everything works
5. Revoke old keys

### 4. Audit Access

- Regularly review who has access to your Vercel project
- Use team roles to limit access to production secrets
- Enable 2FA on Vercel accounts

## Deployment Setup

### Web App (Main Application)

1. **Create Vercel Project**
   ```bash
   cd apps/web
   vercel
   ```

2. **Configure Build Settings**
   - Framework Preset: SvelteKit
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `.svelte-kit`

3. **Add Environment Variables** (via dashboard or CLI)

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Admin App (Admin Dashboard)

1. **Create Separate Vercel Project**
   ```bash
   cd apps/admin
   vercel
   ```

2. **Configure Build Settings**
   - Framework Preset: SvelteKit
   - Root Directory: `apps/admin`
   - Build Command: `npm run build`
   - Output Directory: `.svelte-kit`

3. **Add Environment Variables**
   - Same as web app
   - **Must include SUPABASE_SERVICE_ROLE_KEY**

4. **Deploy**
   ```bash
   vercel --prod
   ```

5. **Use Custom Domain** (recommended)
   - Set up `admin.yourdomain.com`
   - Configure in Vercel dashboard

## Troubleshooting

### "Missing environment variable" errors

**Problem**: Build fails with missing env var error.

**Solution**:
1. Check variable name matches exactly (case-sensitive)
2. Verify variable is set for the correct environment
3. Redeploy after adding variables

### Service role key exposed in browser

**Problem**: Service role key visible in browser console.

**Solution**:
1. Immediately rotate the key in Supabase
2. Check you're importing from `$env/static/private`, not `$env/static/public`
3. Only use in `*.server.ts` files

### Variables not updating after change

**Problem**: Updated env vars not reflected in deployment.

**Solution**:
1. Redeploy the application
2. Clear Vercel build cache if needed
3. Check you updated the correct environment (production/preview/dev)

## Vercel CLI Quick Reference

```bash
# Link project
vercel link

# List environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME

# Pull environment variables to local
vercel env pull .env.local

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## Migration from SOPS

If you previously used SOPS:

1. ✅ SOPS files have been removed
2. ✅ Environment variables are now managed via Vercel
3. ✅ Local development uses `.env.development.local`
4. ✅ Production secrets are stored securely in Vercel

**What changed**:
- No more `.secrets.env` or `.sops.yaml`
- No more SOPS encryption/decryption
- Simpler deployment process
- Better integration with Vercel platform

## Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [SvelteKit Environment Variables](https://kit.svelte.dev/docs/modules#$env-static-private)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
