<svelte:options runes={true} />

<script lang="ts">
  import type { MasteryDistribution } from '$lib/types/progress';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    distribution: MasteryDistribution;
  }

  let { distribution }: Props = $props();

  const total = $derived(
    distribution.new + distribution.learning + distribution.familiar + distribution.mastered
  );

  const categories = $derived([
    {
      key: 'new',
      label: 'New',
      value: distribution.new,
      color: '#cbd5e1',
      percentage: total > 0 ? (distribution.new / total) * 100 : 0,
    },
    {
      key: 'learning',
      label: 'Learning',
      value: distribution.learning,
      color: '#fbbf24',
      percentage: total > 0 ? (distribution.learning / total) * 100 : 0,
    },
    {
      key: 'familiar',
      label: 'Familiar',
      value: distribution.familiar,
      color: '#60a5fa',
      percentage: total > 0 ? (distribution.familiar / total) * 100 : 0,
    },
    {
      key: 'mastered',
      label: 'Mastered',
      value: distribution.mastered,
      color: '#34d399',
      percentage: total > 0 ? (distribution.mastered / total) * 100 : 0,
    },
  ]);
</script>

<div class="mastery-chart">
  {#if total > 0}
    <!-- Bar chart -->
    <div class="bar-chart">
      {#each categories as category}
        {#if category.value > 0}
          <div
            class="bar-segment"
            style="flex-grow: {category.percentage}; background-color: {category.color}"
            title="{category.label}: {category.value} ({category.percentage.toFixed(1)}%)"
          ></div>
        {/if}
      {/each}
    </div>

    <!-- Legend -->
    <div class="legend">
      {#each categories as category}
        <div class="legend-item">
          <div class="legend-color" style="background-color: {category.color}"></div>
          <span class="legend-label">{category.label}</span>
          <span class="legend-value">{category.value}</span>
          <span class="legend-percentage">({category.percentage.toFixed(1)}%)</span>
        </div>
      {/each}
    </div>

    <!-- Total -->
    <div class="total">
      <strong>Total Cards:</strong>
      {total}
    </div>
  {:else}
    <div class="no-data">No cards to display</div>
  {/if}
</div>

<style>
  .mastery-chart {
    width: 100%;
  }

  .bar-chart {
    display: flex;
    width: 100%;
    height: 40px;
    border-radius: 0.5rem;
    overflow: hidden;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .bar-segment {
    min-width: 2px;
    transition: opacity 0.2s;
    cursor: pointer;
  }

  .bar-segment:hover {
    opacity: 0.8;
  }

  .legend {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .legend-label {
    color: var(--color-text);
  }

  .legend-value {
    font-weight: 600;
    color: var(--color-heading);
  }

  .legend-percentage {
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }

  .total {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-secondary);
  }

  .total strong {
    color: var(--color-heading);
  }

  .no-data {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
  }
</style>
