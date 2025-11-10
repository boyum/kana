import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// POST create card attempt within a session
export const POST: RequestHandler = async ({ locals, request }) => {
  const { supabase, session } = locals;

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  try {
    const body = await request.json();
    const {
      session_id,
      card_id,
      response_time_ms,
      was_correct,
      was_skipped = false,
      difficulty_rating,
      notes,
    } = body;

    if (!session_id || !card_id) {
      throw error(400, 'session_id and card_id are required');
    }

    // Verify the session belongs to the user
    const { data: practiceSession, error: sessionError } = await supabase
      .from('practice_sessions')
      .select('id, user_id')
      .eq('id', session_id)
      .eq('user_id', session.user.id)
      .single();

    if (sessionError || !practiceSession) {
      throw error(404, 'Session not found or access denied');
    }

    const { data: attempt, error: insertError } = await supabase
      .from('session_card_attempts')
      .insert({
        session_id,
        card_id,
        attempted_at: new Date().toISOString(),
        response_time_ms,
        was_correct,
        was_skipped,
        difficulty_rating,
        notes,
      })
      .select()
      .single();

    if (insertError) {
      throw error(500, `Failed to create attempt: ${insertError.message}`);
    }

    return json({ attempt }, { status: 201 });
  } catch (e) {
    console.error('Error creating card attempt:', e);
    if (e instanceof Response) throw e;
    throw error(500, 'Failed to create card attempt');
  }
};

// GET attempts for a specific session
export const GET: RequestHandler = async ({ locals, url }) => {
  const { supabase, session } = locals;

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    throw error(400, 'sessionId parameter is required');
  }

  try {
    // Verify the session belongs to the user
    const { data: practiceSession, error: sessionError } = await supabase
      .from('practice_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .eq('user_id', session.user.id)
      .single();

    if (sessionError || !practiceSession) {
      throw error(404, 'Session not found or access denied');
    }

    const { data: attempts, error: attemptsError } = await supabase
      .from('session_card_attempts')
      .select(
        `
        *,
        cards:card_id (
          id,
          front,
          back,
          meaning
        )
      `
      )
      .eq('session_id', sessionId)
      .order('attempted_at', { ascending: true });

    if (attemptsError) {
      throw error(500, `Failed to fetch attempts: ${attemptsError.message}`);
    }

    return json({ attempts });
  } catch (e) {
    console.error('Error fetching card attempts:', e);
    if (e instanceof Response) throw e;
    throw error(500, 'Failed to fetch card attempts');
  }
};
