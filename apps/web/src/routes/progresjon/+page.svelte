<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import { progressStore } from '$lib/stores/progress.svelte';
  import ProgressChart from '$lib/components/ProgressChart.svelte';
  import MasteryDistributionChart from '$lib/components/MasteryDistributionChart.svelte';
  import StreakDisplay from '$lib/components/StreakDisplay.svelte';
  import SessionHistory from '$lib/components/SessionHistory.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let selectedPeriod = $state(30); // days
  const periods = [7, 14, 30, 90];

  onMount(() => {
    // Initialize store with preloaded data
    if (data.initialStats) {
      progressStore.stats = data.initialStats;
    }
    if (data.initialSessions) {
      progressStore.sessions = data.initialSessions;
    }
  });

  async function loadData() {
    await Promise.all([
      progressStore.fetchStats(undefined, selectedPeriod),
      progressStore.fetchSessions(undefined, 20),
    ]);
  }

  function handlePeriodChange(days: number) {
    selectedPeriod = days;
    loadData();
  }

  function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  function formatTime(ms: number): string {
    return `${(ms / 1000).toFixed(1)}s`;
  }
</script>

<div class="progress-container">
  <header class="progress-header">
    <h1>{m.progress_title()}</h1>
    <div class="period-selector">
      {#each periods as period}
        <button
          class="period-button"
          class:active={selectedPeriod === period}
          onclick={() => handlePeriodChange(period)}
        >
          {period}d
        </button>
      {/each}
    </div>
  </header>

  {#if progressStore.loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>{m.loading()}</p>
    </div>
  {:else if progressStore.error}
    <div class="error-message">
      <p>{progressStore.error}</p>
      <button onclick={loadData}>{m.retry()}</button>
    </div>
  {:else if progressStore.stats}
    {@const stats = progressStore.stats}

    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <StreakDisplay streak={stats.summary.currentStreak} />
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <div class="stat-value">{stats.summary.totalCardsReviewed}</div>
          <div class="stat-label">{m.cards_reviewed()}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{stats.summary.averageAccuracy.toFixed(1)}%</div>
          <div class="stat-label">{m.accuracy()}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-value">{formatDuration(stats.summary.totalDurationMs)}</div>
          <div class="stat-label">{m.total_time()}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{stats.summary.totalSessions}</div>
          <div class="stat-label">{m.sessions()}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-value">{formatTime(stats.summary.averageResponseTime)}</div>
          <div class="stat-label">{m.avg_response_time()}</div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container">
        <h2>{m.daily_activity()}</h2>
        <ProgressChart data={stats.dailyStats} />
      </div>

      <div class="chart-container">
        <h2>{m.mastery_distribution()}</h2>
        <MasteryDistributionChart distribution={stats.masteryDistribution} />
      </div>
    </div>

    <!-- Recent Sessions -->
    <div class="sessions-section">
      <h2>{m.recent_sessions()}</h2>
      <SessionHistory sessions={progressStore.sessions} />
    </div>
  {:else}
    <div class="empty-state">
      <p>{m.no_progress_data()}</p>
      <p class="hint">{m.start_practicing_hint()}</p>
    </div>
  {/if}
</div>

<style>
  .progress-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .progress-header h1 {
    font-size: 2rem;
    color: var(--color-heading);
    margin: 0;
  }

  .period-selector {
    display: flex;
    gap: 0.5rem;
    background: var(--color-bg-secondary);
    padding: 0.25rem;
    border-radius: 0.5rem;
  }

  .period-button {
    padding: 0.5rem 1rem;
    border: none;
    background: transparent;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    color: var(--color-text-secondary);
  }

  .period-button:hover {
    background: var(--color-bg-hover);
  }

  .period-button.active {
    background: var(--color-accent);
    color: white;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-heading);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-top: 0.25rem;
  }

  .charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .chart-container {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .chart-container h2 {
    font-size: 1.25rem;
    color: var(--color-heading);
    margin: 0 0 1rem 0;
  }

  .sessions-section {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .sessions-section h2 {
    font-size: 1.25rem;
    color: var(--color-heading);
    margin: 0 0 1rem 0;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: var(--color-text-secondary);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-bg-secondary);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-message {
    text-align: center;
    padding: 2rem;
    background: #fee;
    border-radius: 0.5rem;
    color: #c33;
  }

  .error-message button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: var(--color-accent);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--color-text-secondary);
  }

  .empty-state .hint {
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }

  @media (max-width: 720px) {
    .progress-header {
      flex-direction: column;
      align-items: stretch;
    }

    .charts-section {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
