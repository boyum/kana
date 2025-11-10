import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET recent practice sessions
export const GET: RequestHandler = async ({ locals, url }) => {
  const { supabase, session } = locals;

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const listId = url.searchParams.get('listId');
  const limit = parseInt(url.searchParams.get('limit') || '20');

  try {
    let query = supabase
      .from('practice_sessions')
      .select(
        `
        *,
        lists:list_id (
          id,
          name
        )
      `
      )
      .eq('user_id', session.user.id)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (listId) {
      query = query.eq('list_id', listId);
    }

    const { data: sessions, error: sessionsError } = await query;

    if (sessionsError) {
      throw error(500, `Failed to fetch sessions: ${sessionsError.message}`);
    }

    return json({ sessions });
  } catch (e) {
    console.error('Error fetching practice sessions:', e);
    throw error(500, 'Failed to fetch practice sessions');
  }
};

// POST create new practice session
export const POST: RequestHandler = async ({ locals, request }) => {
  const { supabase, session } = locals;

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  try {
    const body = await request.json();
    const { list_id, session_type = 'practice', direction = 'front-to-back' } = body;

    if (!list_id) {
      throw error(400, 'list_id is required');
    }

    // Verify the list belongs to the user
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('id')
      .eq('id', list_id)
      .eq('user_id', session.user.id)
      .single();

    if (listError || !list) {
      throw error(404, 'List not found or access denied');
    }

    const { data: newSession, error: insertError } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: session.user.id,
        list_id,
        session_type,
        direction,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw error(500, `Failed to create session: ${insertError.message}`);
    }

    return json({ session: newSession }, { status: 201 });
  } catch (e) {
    console.error('Error creating practice session:', e);
    if (e instanceof Response) throw e;
    throw error(500, 'Failed to create practice session');
  }
};

// PATCH update existing practice session
export const PATCH: RequestHandler = async ({ locals, request }) => {
  const { supabase, session } = locals;

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  try {
    const body = await request.json();
    const {
      session_id,
      ended_at,
      duration_ms,
      total_cards,
      cards_reviewed,
      correct_answers,
      incorrect_answers,
      skipped_cards,
      average_response_time_ms,
      completed,
    } = body;

    if (!session_id) {
      throw error(400, 'session_id is required');
    }

    // Verify the session belongs to the user
    const { data: existingSession, error: sessionError } = await supabase
      .from('practice_sessions')
      .select('id, user_id')
      .eq('id', session_id)
      .eq('user_id', session.user.id)
      .single();

    if (sessionError || !existingSession) {
      throw error(404, 'Session not found or access denied');
    }

    const updateData: Record<string, unknown> = {};
    if (ended_at !== undefined) updateData.ended_at = ended_at;
    if (duration_ms !== undefined) updateData.duration_ms = duration_ms;
    if (total_cards !== undefined) updateData.total_cards = total_cards;
    if (cards_reviewed !== undefined) updateData.cards_reviewed = cards_reviewed;
    if (correct_answers !== undefined) updateData.correct_answers = correct_answers;
    if (incorrect_answers !== undefined) updateData.incorrect_answers = incorrect_answers;
    if (skipped_cards !== undefined) updateData.skipped_cards = skipped_cards;
    if (average_response_time_ms !== undefined)
      updateData.average_response_time_ms = average_response_time_ms;
    if (completed !== undefined) updateData.completed = completed;

    const { data: updatedSession, error: updateError } = await supabase
      .from('practice_sessions')
      .update(updateData)
      .eq('id', session_id)
      .select()
      .single();

    if (updateError) {
      throw error(500, `Failed to update session: ${updateError.message}`);
    }

    return json({ session: updatedSession });
  } catch (e) {
    console.error('Error updating practice session:', e);
    if (e instanceof Response) throw e;
    throw error(500, 'Failed to update practice session');
  }
};
