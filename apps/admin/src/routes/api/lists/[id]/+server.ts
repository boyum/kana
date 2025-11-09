import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/supabase.server';
import { ListsService } from '@kana/db-services';

const listsService = new ListsService(supabaseAdmin);

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.isAdmin) {
    throw error(403, 'Admin access required');
  }

  try {
    await listsService.deleteList(params.id);
    return json({ success: true });
  } catch (e) {
    console.error('Error deleting list:', e);
    throw error(500, 'Failed to delete list');
  }
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.isAdmin) {
    throw error(403, 'Admin access required');
  }

  try {
    const updates = await request.json();
    const updatedList = await listsService.updateList(params.id, updates);
    return json(updatedList);
  } catch (e) {
    console.error('Error updating list:', e);
    throw error(500, 'Failed to update list');
  }
};
