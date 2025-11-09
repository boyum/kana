/**
 * Shared database service for authentication and authorization
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DbProfile } from './types.js';

export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Check if a user is an admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === 'admin';
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<DbProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Set user role
   */
  async setUserRole(
    userId: string,
    role: 'user' | 'admin'
  ): Promise<DbProfile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .upsert({
        id: userId,
        role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to set user role: ${error.message}`);
    }

    return data;
  }
}
