/**
 * Script to set a user as admin
 * Usage: npx tsx apps/web/scripts/set-admin.ts <user-id-or-email>
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setAdmin(userIdOrEmail: string) {
  console.log(`🔍 Looking up user: ${userIdOrEmail}...`);

  let userId = userIdOrEmail;

  // If it looks like an email, fetch the user ID
  if (userIdOrEmail.includes('@')) {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      process.exit(1);
    }

    const user = users.users.find(u => u.email === userIdOrEmail);

    if (!user) {
      console.error(`❌ No user found with email: ${userIdOrEmail}`);
      process.exit(1);
    }

    userId = user.id;
    console.log(`✅ Found user: ${user.email} (ID: ${userId})`);
  }

  // Check if profile exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('❌ Error checking profile:', profileError.message);
    process.exit(1);
  }

  // Insert or update profile with admin role
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      role: 'admin',
      updated_at: new Date().toISOString()
    });

  if (upsertError) {
    console.error('❌ Error setting admin role:', upsertError.message);
    process.exit(1);
  }

  console.log('✅ Successfully set user as admin!');

  // Verify
  const { data: updatedProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  console.log('📋 Profile:', updatedProfile);
}

// Get user ID/email from command line
const userIdOrEmail = process.argv[2];

if (!userIdOrEmail) {
  console.error('❌ Usage: npx tsx apps/web/scripts/set-admin.ts <user-id-or-email>');
  console.error('   Example: npx tsx apps/web/scripts/set-admin.ts user@example.com');
  process.exit(1);
}

setAdmin(userIdOrEmail)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
