import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/supabase.server';
import { ListsService } from '@kana/db-services';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.isAdmin) {
    throw error(403, 'Admin access required');
  }

  const filter = url.searchParams.get('filter') as 'public' | 'example' | 'user' | null;
  const search = url.searchParams.get('search');

  const listsService = new ListsService(supabaseAdmin);

  try {
    const lists = await listsService.getAllLists({
      filter: filter ?? undefined,
      search: search ?? undefined,
    });

    return json(lists);
  } catch (e) {
    console.error('Error fetching lists:', e);
    throw error(500, 'Failed to fetch lists');
  }
};
