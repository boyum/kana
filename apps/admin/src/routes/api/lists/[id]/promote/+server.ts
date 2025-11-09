import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/supabase.server';
import { ListsService } from '@kana/db-services';

export const POST: RequestHandler = async ({ params, locals }) => {
  if (!locals.isAdmin) {
    throw error(403, 'Admin access required');
  }

  const listsService = new ListsService(supabaseAdmin);

  try {
    const updatedList = await listsService.promoteToExample(params.id);
    return json(updatedList);
  } catch (e) {
    console.error('Error promoting list:', e);
    throw error(500, 'Failed to promote list');
  }
};
