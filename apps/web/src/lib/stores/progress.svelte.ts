import type { ProgressStats, PracticeSession } from '$lib/types/progress';

class ProgressStore {
  stats = $state<ProgressStats | null>(null);
  sessions = $state<PracticeSession[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);
  currentSession = $state<PracticeSession | null>(null);

  async fetchStats(listId?: string, days: number = 30) {
    this.loading = true;
    this.error = null;

    try {
      const params = new URLSearchParams();
      if (listId) params.set('listId', listId);
      params.set('days', days.toString());

      const response = await fetch(`/api/progress/stats?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch progress statistics');
      }

      this.stats = await response.json();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching progress stats:', err);
    } finally {
      this.loading = false;
    }
  }

  async fetchSessions(listId?: string, limit: number = 20) {
    this.loading = true;
    this.error = null;

    try {
      const params = new URLSearchParams();
      if (listId) params.set('listId', listId);
      params.set('limit', limit.toString());

      const response = await fetch(`/api/progress/sessions?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      this.sessions = data.sessions;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching sessions:', err);
    } finally {
      this.loading = false;
    }
  }

  async startSession(listId: string, sessionType: 'practice' | 'test' | 'review' = 'practice') {
    try {
      const response = await fetch('/api/progress/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list_id: listId,
          session_type: sessionType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const data = await response.json();
      this.currentSession = data.session;
      return data.session;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error starting session:', err);
      throw err;
    }
  }

  async completeSession(
    sessionId: string,
    stats: {
      ended_at: string;
      duration_ms: number;
      total_cards: number;
      cards_reviewed: number;
      correct_answers: number;
      incorrect_answers: number;
      skipped_cards: number;
      average_response_time_ms: number;
    }
  ) {
    try {
      const response = await fetch('/api/progress/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          ...stats,
          completed: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      const data = await response.json();
      this.currentSession = null;
      return data.session;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error completing session:', err);
      throw err;
    }
  }

  async recordAttempt(
    sessionId: string,
    cardId: string,
    wasCorrect: boolean,
    responseTimeMs?: number,
    wasSkipped: boolean = false
  ) {
    try {
      const response = await fetch('/api/progress/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          card_id: cardId,
          was_correct: wasCorrect,
          response_time_ms: responseTimeMs,
          was_skipped: wasSkipped,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record attempt');
      }

      return await response.json();
    } catch (err) {
      console.error('Error recording attempt:', err);
      // Don't throw - we don't want to interrupt the user's practice session
      // if recording fails
    }
  }

  reset() {
    this.stats = null;
    this.sessions = [];
    this.currentSession = null;
    this.loading = false;
    this.error = null;
  }
}

export const progressStore = new ProgressStore();
