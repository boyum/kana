# Vercel Environment Variables Setup

This document lists all the environment variables required for deploying the Kana monorepo to Vercel.

## Required Environment Variables

### Public Variables (Exposed to Browser)

These variables are prefixed with `PUBLIC_` and will be visible in the browser bundle. They're safe to expose as they're meant for client-side use.

| Variable | Description | Example | Where to Get It |
|----------|-------------|---------|-----------------|
| `PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` | [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGc...` | [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API → `anon` `public` key |

### Private Variables (Server-Side Only)

These variables must NEVER be exposed to the browser. They contain sensitive credentials.

| Variable | Description | Example | Where to Get It |
|----------|-------------|---------|-----------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) | `eyJhbGc...` | [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API → `service_role` `secret` key |

## Setting Up Environment Variables in Vercel

### Via Vercel Dashboard

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable from the tables above
4. For each variable, select the appropriate environments:
   - **Production**: For your main production deployment
   - **Preview**: For preview deployments (PRs)
   - **Development**: For local development (optional, use `.env.local` instead)

### Via Vercel CLI

```bash
# Set production environment variables
vercel env add PUBLIC_SUPABASE_URL production
vercel env add PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Set preview environment variables (for PR deployments)
vercel env add PUBLIC_SUPABASE_URL preview
vercel env add PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```

## Local Development

For local development, create a `.env.local` file in the root directory (already in `.gitignore`):

```bash
# Copy the example file
cp .env.example .env.local

# Then edit .env.local with your actual values
```

The `.env.local` file will be automatically loaded by SvelteKit during development.

## Apps Configuration

### @kana/web (Main Web App)

Uses all three environment variables:
- `PUBLIC_SUPABASE_URL` - For client-side Supabase client
- `PUBLIC_SUPABASE_ANON_KEY` - For client-side Supabase client
- `SUPABASE_SERVICE_ROLE_KEY` - For server-side admin operations

### @kana/admin (Admin App)

Uses all three environment variables:
- `PUBLIC_SUPABASE_URL` - For client-side Supabase client
- `PUBLIC_SUPABASE_ANON_KEY` - For client-side Supabase client
- `SUPABASE_SERVICE_ROLE_KEY` - For server-side admin operations

## Security Notes

1. **NEVER commit** `.env.local` or any file containing actual credentials to Git
2. **NEVER expose** `SUPABASE_SERVICE_ROLE_KEY` to the browser - this key bypasses Row Level Security (RLS)
3. **Always use** `PUBLIC_` prefix for variables that need to be accessible in the browser
4. **Rotate keys** regularly and update them in Vercel when you do

## Troubleshooting

### Build Warnings About Missing Environment Variables

If you see warnings during build about environment variables, ensure:

1. All variables are set in Vercel Dashboard for the correct environment (Production/Preview)
2. Variable names match exactly (case-sensitive)
3. No typos in variable names
4. Variables are not commented out in Vercel settings

### Runtime Errors About Missing Environment Variables

If the app throws errors at runtime:

1. Check Vercel deployment logs for which variable is missing
2. Verify the variable is set for the correct environment
3. Redeploy after adding missing variables
4. Check that the variable name uses the correct prefix (`PUBLIC_` or not)

## References

- [SvelteKit Environment Variables](https://kit.svelte.dev/docs/modules#$env-static-private)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Supabase API Settings](https://supabase.com/dashboard)
