<svelte:options runes={true} />

<script lang="ts">
  import type { CustomFlashCard } from "$lib/types/customLists";
  import {
    getAverageResponseTime,
    getSuccessRate,
    getCardDifficulty,
    formatTime,
  } from "$lib/utils/performance";

  interface Props {
    cards?: CustomFlashCard[];
    showSessionStats?: boolean;
  }

  let { cards = [], showSessionStats = true }: Props = $props();

  // Calculate stats
  let totalViews = $derived(cards.reduce((sum, card) => sum + card.performance.viewCount, 0));
  let totalFlips = $derived(cards.reduce((sum, card) => sum + card.performance.flipCount, 0));
  let totalCorrect = $derived(cards.reduce((sum, card) => sum + card.performance.correctCount, 0));
  let averageResponseTime = $derived(Math.round(
    cards.reduce((sum, card) => sum + card.performance.totalResponseTimeMs, 0) /
      Math.max(1, totalViews)
  ));
  let overallSuccessRate = $derived(totalViews === 0 ? 0 : Math.round((totalCorrect / totalViews) * 100));

  // Count difficulties
  let difficulties = $derived({
    new: cards.filter(c => getCardDifficulty(c.performance) === "new").length,
    easy: cards.filter(c => getCardDifficulty(c.performance) === "easy").length,
    medium: cards.filter(c => getCardDifficulty(c.performance) === "medium").length,
    hard: cards.filter(c => getCardDifficulty(c.performance) === "hard").length,
  });

  // Find masteries
  let masteredCards = $derived(cards.filter(c => c.performance.masteryLevel >= 80).length);
  let mostDifficultCards = $derived(cards
    .sort((a, b) => b.performance.masteryLevel - a.performance.masteryLevel)
    .slice(-3)
    .reverse());

  function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case "new":
        return "var(--color-accent)";
      case "easy":
        return "var(--color-success, #10b981)";
      case "medium":
        return "var(--color-warning, #f59e0b)";
      case "hard":
        return "var(--color-danger, #ef4444)";
      default:
        return "var(--color-text)";
    }
  }

  function getDifficultyLabel(difficulty: string): string {
    const labels: Record<string, string> = {
      new: "Nye",
      easy: "Enkle",
      medium: "Medium",
      hard: "Vanskelige",
    };
    return labels[difficulty] || difficulty;
  }
</script>

<div class="stats-container">
  {#if showSessionStats && totalViews > 0}
    <div class="stats-section">
      <h3>📊 Session Statistics</h3>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-value">{totalViews}</div>
          <div class="stat-label">Card Views</div>
        </div>
        <div class="stat">
          <div class="stat-value">{overallSuccessRate}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
        <div class="stat">
          <div class="stat-value">{formatTime(averageResponseTime)}</div>
          <div class="stat-label">Avg. Time</div>
        </div>
        <div class="stat">
          <div class="stat-value">{totalFlips}</div>
          <div class="stat-label">Total Flips</div>
        </div>
      </div>
    </div>
  {/if}

  {#if cards.length > 0}
    <div class="stats-section">
      <h3>📈 Card Difficulty Distribution</h3>
      <div class="difficulty-grid">
        <div class="difficulty-stat">
          <span class="difficulty-indicator" style="background-color: var(--color-accent)"></span>
          <span class="label">{getDifficultyLabel("new")}</span>
          <span class="count">{difficulties.new}</span>
        </div>
        <div class="difficulty-stat">
          <span class="difficulty-indicator" style="background-color: var(--color-success, #10b981)"></span>
          <span class="label">{getDifficultyLabel("easy")}</span>
          <span class="count">{difficulties.easy}</span>
        </div>
        <div class="difficulty-stat">
          <span class="difficulty-indicator" style="background-color: var(--color-warning, #f59e0b)"></span>
          <span class="label">{getDifficultyLabel("medium")}</span>
          <span class="count">{difficulties.medium}</span>
        </div>
        <div class="difficulty-stat">
          <span class="difficulty-indicator" style="background-color: var(--color-danger, #ef4444)"></span>
          <span class="label">{getDifficultyLabel("hard")}</span>
          <span class="count">{difficulties.hard}</span>
        </div>
      </div>
    </div>

    {#if masteredCards > 0}
      <div class="stats-section">
        <h3>⭐ Mastery Progress</h3>
        <div class="mastery-info">
          <div class="mastery-stat">
            <div class="stat-value">{masteredCards}</div>
            <div class="stat-label">Cards Mastered (≥80%)</div>
          </div>
          <div class="mastery-bar">
            <div
              class="mastery-progress"
              style="width: {(masteredCards / cards.length) * 100}%"
            ></div>
          </div>
          <div class="mastery-percent">{Math.round((masteredCards / cards.length) * 100)}%</div>
        </div>
      </div>
    {/if}

    {#if mostDifficultCards.length > 0}
      <div class="stats-section">
        <h3>🎯 Cards Needing Practice</h3>
        <div class="difficult-cards">
          {#each mostDifficultCards as card}
            {@const difficulty = getCardDifficulty(card.performance)}
            {@const views = card.performance.viewCount}
            {@const successRate = getSuccessRate(card.performance)}
            <div class="card-info">
              <div class="card-content">
                <span class="card-front">{card.front}</span>
                <span class="card-back">{card.back}</span>
              </div>
              <div class="card-stats">
                <span
                  class="difficulty-badge"
                  style="background-color: {getDifficultyColor(difficulty)}"
                >
                  {getDifficultyLabel(difficulty)}
                </span>
                <span class="views">{views}x</span>
                <span class="success-rate">{successRate}%</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .stats-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1.5rem;
    background: var(--color-surface, #f9fafb);
    border-radius: 12px;
    margin-top: 2rem;
  }

  .stats-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .stats-section h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-heading);
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-accent);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    text-align: center;
  }

  .difficulty-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
  }

  .difficulty-stat {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .difficulty-indicator {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .difficulty-stat .label {
    flex: 1;
    font-size: 0.9rem;
    color: var(--color-text);
  }

  .difficulty-stat .count {
    font-weight: 600;
    color: var(--color-heading);
  }

  .mastery-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .mastery-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .mastery-bar {
    width: 100%;
    height: 8px;
    background: var(--color-border, #e5e7eb);
    border-radius: 4px;
    overflow: hidden;
  }

  .mastery-progress {
    height: 100%;
    background: linear-gradient(90deg, #80a4ed 0%, #6b8fd6 100%);
    transition: width 0.3s ease;
  }

  .mastery-percent {
    text-align: center;
    font-size: 0.9rem;
    color: var(--color-accent);
    font-weight: 600;
  }

  .difficult-cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .card-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card-content {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex: 1;
  }

  .card-front {
    font-weight: 700;
    font-size: 1.2rem;
    color: var(--color-heading);
    min-width: 40px;
  }

  .card-back {
    font-size: 0.9rem;
    color: var(--color-text-secondary, #6b7280);
  }

  .card-stats {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .difficulty-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
  }

  .views,
  .success-rate {
    font-size: 0.9rem;
    color: var(--color-text-secondary, #6b7280);
    white-space: nowrap;
  }

  @media (max-width: 720px) {
    .stats-container {
      padding: 1rem;
      gap: 1.5rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .stat {
      padding: 0.75rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .card-info {
      flex-direction: column;
      align-items: flex-start;
    }

    .card-stats {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
