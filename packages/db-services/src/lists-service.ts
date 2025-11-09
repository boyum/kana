/**
 * Shared database service for lists management
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DbList, ListWithCardCount, ListUpdateFields } from './types.js';

export class ListsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all lists with optional filtering
   */
  async getAllLists(options?: {
    filter?: 'public' | 'example' | 'user';
    search?: string;
    userId?: string;
  }): Promise<ListWithCardCount[]> {
    let query = this.supabase
      .from('lists')
      .select(`
        *,
        cards:cards(count)
      `)
      .order('created_at', { ascending: false });

    // Filter by user
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    // Apply type filters
    if (options?.filter === 'public') {
      query = query.eq('is_public', true);
    } else if (options?.filter === 'example') {
      query = query.eq('is_example', true);
    } else if (options?.filter === 'user') {
      query = query.not('user_id', 'is', null);
    }

    // Apply search
    if (options?.search && options.search.trim()) {
      query = query.or(
        `name.ilike.%${options.search}%,description.ilike.%${options.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch lists: ${error.message}`);
    }

    return (data || []) as ListWithCardCount[];
  }

  /**
   * Get a single list by ID
   */
  async getList(id: string): Promise<DbList | null> {
    const { data, error } = await this.supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch list: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a list
   */
  async updateList(id: string, updates: ListUpdateFields): Promise<DbList> {
    const sanitizedUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('lists')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update list: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a list
   */
  async deleteList(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('lists')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete list: ${error.message}`);
    }
  }

  /**
   * Publish a list (make it public)
   */
  async publishList(id: string): Promise<DbList> {
    return this.updateList(id, { is_public: true });
  }

  /**
   * Unpublish a list (make it private)
   */
  async unpublishList(id: string): Promise<DbList> {
    return this.updateList(id, { is_public: false });
  }

  /**
   * Promote a list to example status
   */
  async promoteToExample(id: string): Promise<DbList> {
    return this.updateList(id, { is_example: true, is_public: true });
  }

  /**
   * Remove example status from a list
   */
  async unpromoteFromExample(id: string): Promise<DbList> {
    return this.updateList(id, { is_example: false });
  }

  /**
   * Get example lists
   */
  async getExampleLists(): Promise<DbList[]> {
    const { data, error } = await this.supabase
      .from('lists')
      .select('*')
      .eq('is_example', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch example lists: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get public lists
   */
  async getPublicLists(): Promise<DbList[]> {
    const { data, error } = await this.supabase
      .from('lists')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch public lists: ${error.message}`);
    }

    return data || [];
  }
}
