<svelte:options runes={true} />

<script lang="ts">
  import type { PracticeSession } from '$lib/types/progress';

  interface Props {
    sessions: PracticeSession[];
  }

  let { sessions }: Props = $props();

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  function formatDuration(ms: number | undefined): string {
    if (!ms) return 'N/A';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  function getAccuracy(session: PracticeSession): number {
    if (session.cards_reviewed === 0) return 0;
    return (session.correct_answers / session.cards_reviewed) * 100;
  }

  function getSessionTypeIcon(type: string): string {
    switch (type) {
      case 'test':
        return '📝';
      case 'review':
        return '🔄';
      default:
        return '📚';
    }
  }
</script>

<div class="session-history">
  {#if sessions.length === 0}
    <div class="no-sessions">No practice sessions yet</div>
  {:else}
    <div class="session-list">
      {#each sessions as session}
        <div class="session-item">
          <div class="session-header">
            <div class="session-icon">
              {getSessionTypeIcon(session.session_type)}
            </div>
            <div class="session-info">
              <div class="session-title">
                {session.lists?.name || 'Unknown List'}
              </div>
              <div class="session-meta">
                {formatDate(session.started_at)}
                {#if session.duration_ms}
                  · {formatDuration(session.duration_ms)}
                {/if}
              </div>
            </div>
            {#if session.completed}
              <div class="session-badge completed">✓ Completed</div>
            {:else}
              <div class="session-badge incomplete">In Progress</div>
            {/if}
          </div>

          {#if session.completed}
            <div class="session-stats">
              <div class="stat">
                <span class="stat-label">Cards</span>
                <span class="stat-value">{session.cards_reviewed}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Accuracy</span>
                <span class="stat-value">{getAccuracy(session).toFixed(1)}%</span>
              </div>
              <div class="stat">
                <span class="stat-label">Correct</span>
                <span class="stat-value correct">{session.correct_answers}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Incorrect</span>
                <span class="stat-value incorrect">{session.incorrect_answers}</span>
              </div>
              {#if session.average_response_time_ms}
                <div class="stat">
                  <span class="stat-label">Avg Time</span>
                  <span class="stat-value">{(session.average_response_time_ms / 1000).toFixed(1)}s</span>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .session-history {
    width: 100%;
  }

  .session-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .session-item {
    background: var(--color-bg-secondary);
    border-radius: 0.75rem;
    padding: 1rem;
    transition: box-shadow 0.2s;
  }

  .session-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .session-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .session-icon {
    font-size: 1.5rem;
  }

  .session-info {
    flex: 1;
  }

  .session-title {
    font-weight: 600;
    color: var(--color-heading);
  }

  .session-meta {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    margin-top: 0.25rem;
  }

  .session-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-weight: 500;
  }

  .session-badge.completed {
    background: #d1fae5;
    color: #065f46;
  }

  .session-badge.incomplete {
    background: #fef3c7;
    color: #92400e;
  }

  .session-stats {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .stat-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-heading);
  }

  .stat-value.correct {
    color: #10b981;
  }

  .stat-value.incorrect {
    color: #ef4444;
  }

  .no-sessions {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
  }

  @media (max-width: 720px) {
    .session-header {
      flex-wrap: wrap;
    }

    .session-stats {
      gap: 0.75rem;
    }

    .stat {
      min-width: 80px;
    }
  }
</style>
