# Supabase Quick Reference

## Essential Commands

```bash
# Start everything (first time or after changes)
npm run supabase:start

# Stop Supabase
npm run supabase:stop

# Reset database (runs migrations + seeds fresh)
npm run supabase:reset

# Check what's running
npm run supabase:status

# Generate TypeScript types (after schema changes)
npm run supabase:types
```

## Important URLs (when running locally)

- **Supabase Studio**: http://127.0.0.1:54323
- **API**: http://127.0.0.1:54321
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

## File Structure

```
supabase/
├── config.toml              # Supabase configuration
├── migrations/              # Database schema (SQL files)
│   └── *.sql               # Applied in order by timestamp
├── seed.sql                # Test data (runs on reset)
└── README.md               # This file
```

## Creating New Tables

1. **Option A: Write SQL directly**
   ```bash
   # Create: supabase/migrations/20250109120000_my_feature.sql
   create table public.my_table (
     id uuid primary key default gen_random_uuid(),
     name text not null
   );
   ```

2. **Option B: Use Studio + Generate Migration**
   - Make changes in Studio (http://127.0.0.1:54323)
   - Run: `npx supabase db diff -f my_feature`
   - Review the generated migration file

3. **Apply changes**
   ```bash
   npm run supabase:reset
   ```

## Environment Variables

- **Local dev**: Uses [.env.local](../.env.local) (safe defaults, can commit)
- **Production**: Uses [.env](../.env) (real credentials, gitignored)

## Full Documentation

See [SUPABASE.md](../SUPABASE.md) for complete guide.
