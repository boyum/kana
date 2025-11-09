# Supabase GitHub OAuth Setup

This guide walks you through enabling GitHub OAuth authentication in Supabase.

## Error

If you see this error:
```json
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

It means GitHub OAuth is not configured in your Supabase project.

## Setup Steps

### 1. Enable GitHub Provider in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open Authentication Settings**
   - Click "Authentication" in the left sidebar
   - Click "Providers" tab

3. **Enable GitHub**
   - Find "GitHub" in the providers list
   - Toggle it to **Enabled**
   - You'll see options for Client ID and Client Secret

### 2. Create GitHub OAuth App

1. **Go to GitHub Settings**
   - Navigate to https://github.com/settings/developers
   - Click "OAuth Apps" → "New OAuth App"

2. **Fill in Application Details**

   **Application name:**
   ```
   Kana (or your preferred name)
   ```

   **Homepage URL:**
   ```
   https://yourdomain.com
   # Or for development:
   http://localhost:5173
   ```

   **Authorization callback URL:**
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

   **Important**: Get this exact URL from Supabase:
   - In Supabase Dashboard → Authentication → Providers → GitHub
   - Copy the "Callback URL (for OAuth)" shown there

3. **Register Application**
   - Click "Register application"
   - You'll see your **Client ID**
   - Click "Generate a new client secret" to get your **Client Secret**

### 3. Configure GitHub OAuth in Supabase

1. **Back in Supabase Dashboard**
   - Go to Authentication → Providers → GitHub

2. **Enter GitHub Credentials**
   - **GitHub Client ID**: Paste from GitHub OAuth app
   - **GitHub Client Secret**: Paste from GitHub OAuth app

3. **Save Configuration**
   - Click "Save"

### 4. Update Redirect URLs (Optional)

If using multiple domains (dev, staging, prod):

1. **In Supabase Dashboard**
   - Go to Authentication → URL Configuration

2. **Add Redirect URLs**
   ```
   http://localhost:5173/*
   http://localhost:5178/*
   https://yourdomain.com/*
   https://admin.yourdomain.com/*
   ```

3. **Add Site URL**
   ```
   https://yourdomain.com
   ```

### 5. Test Authentication

1. **Start your application**
   ```bash
   npm run dev --workspace=@kana/admin
   ```

2. **Try signing in**
   - Navigate to http://localhost:5178/login
   - Click "Sign in with GitHub"
   - You should be redirected to GitHub for authorization

3. **Verify in Supabase**
   - After successful login, check Authentication → Users
   - You should see your user account

## For Admin App Only

If you want to use the admin app separately:

1. **Create a separate GitHub OAuth App** (optional but recommended)
   - Application name: "Kana Admin"
   - Callback URL: `https://your-project.supabase.co/auth/v1/callback`

2. **Or use the same OAuth app**
   - The callback URL is the same for both apps
   - Supabase handles the routing

## Troubleshooting

### "Callback URL mismatch" error

**Problem**: The callback URL in GitHub doesn't match Supabase.

**Solution**:
1. Copy the exact callback URL from Supabase dashboard
2. Update it in your GitHub OAuth app settings
3. Make sure there are no trailing slashes or typos

### "redirect_uri_mismatch" error

**Problem**: Your site URL isn't in the allowed list.

**Solution**:
1. In Supabase Dashboard → Authentication → URL Configuration
2. Add your domain to "Redirect URLs"
3. Format: `http://localhost:5178/*` or `https://yourdomain.com/*`

### Still getting "provider is not enabled"

**Problem**: Changes haven't propagated or cache issue.

**Solution**:
1. Wait 1-2 minutes after saving changes
2. Hard refresh your browser (Cmd+Shift+R / Ctrl+Shift+R)
3. Check Supabase logs: Dashboard → Logs → Authentication
4. Verify GitHub provider toggle is ON

### Multiple domains not working

**Problem**: Auth works on localhost but not production.

**Solution**:
1. Add all domains to Supabase redirect URLs
2. Use wildcards: `https://yourdomain.com/*`
3. Make sure Site URL is set to your primary domain

## Environment Variables

After setup, verify these are set:

```env
SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The OAuth configuration is stored in Supabase, not in environment variables.

## Local Development with Supabase CLI

If using local Supabase (`supabase start`):

1. **Configure in local config**
   - Edit `supabase/config.toml`
   - Add GitHub provider credentials

2. **Or use hosted Supabase**
   - Point your local app to hosted Supabase
   - Use the hosted project's URL and keys

## Security Notes

- ✅ GitHub OAuth apps are tied to your GitHub account
- ✅ Supabase validates all callbacks
- ✅ Client Secret is stored securely in Supabase
- ⚠️ Never expose Client Secret in client code
- ⚠️ Keep your Supabase Service Role Key separate

## Quick Reference

### Supabase URLs

```
Auth Callback URL:
https://your-project.supabase.co/auth/v1/callback

Project URL:
https://your-project.supabase.co
```

### GitHub OAuth App Settings

```
Homepage URL:       https://yourdomain.com
Authorization URL:  https://your-project.supabase.co/auth/v1/callback
```

### Supabase Redirect URLs

```
http://localhost:5173/*
http://localhost:5178/*
https://yourdomain.com/*
https://admin.yourdomain.com/*
```

## Resources

- [Supabase Auth - GitHub Provider](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/auth-helpers/sveltekit)

## Summary Checklist

- [ ] GitHub OAuth app created
- [ ] Client ID and Secret generated
- [ ] GitHub provider enabled in Supabase
- [ ] Client ID and Secret added to Supabase
- [ ] Callback URL matches Supabase URL
- [ ] Redirect URLs configured for all domains
- [ ] Tested login on localhost
- [ ] Tested login on production (if deployed)
- [ ] User appears in Supabase Authentication → Users
