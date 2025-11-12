<svelte:options runes={true} />

<script lang="ts">
  import type { DailyStat } from '$lib/types/progress';

  interface Props {
    data: DailyStat[];
  }

  let { data }: Props = $props();

  const chartData = $derived(() => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map((d) => d.cards_reviewed));
    const height = 200;
    const width = 600;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((stat, i) => {
      const x = padding + (i / Math.max(data.length - 1, 1)) * chartWidth;
      const y = padding + chartHeight - (stat.cards_reviewed / Math.max(maxValue, 1)) * chartHeight;
      return { x, y, stat };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

    const areaPath =
      linePath +
      ` L ${points[points.length - 1].x},${height - padding} L ${padding},${height - padding} Z`;

    return {
      width,
      height,
      padding,
      maxValue,
      points,
      linePath,
      areaPath,
    };
  });

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
</script>

<div class="chart-wrapper">
  {#if chartData()}
    {@const chart = chartData()}
    <svg viewBox="0 0 {chart.width} {chart.height}" class="chart">
      <!-- Grid lines -->
      <line
        x1={chart.padding}
        y1={chart.height - chart.padding}
        x2={chart.width - chart.padding}
        y2={chart.height - chart.padding}
        stroke="#e5e7eb"
        stroke-width="1"
      />

      <!-- Area fill -->
      <path d={chart.areaPath} fill="url(#gradient)" opacity="0.2" />

      <!-- Line -->
      <path
        d={chart.linePath}
        fill="none"
        stroke="var(--color-accent)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Data points -->
      {#each chart.points as point, i}
        <circle
          cx={point.x}
          cy={point.y}
          r="4"
          fill="var(--color-accent)"
          class="data-point"
          data-index={i}
        >
          <title>{formatDate(point.stat.date)}: {point.stat.cards_reviewed} cards</title>
        </circle>
      {/each}

      <!-- Gradient definition -->
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:var(--color-accent);stop-opacity:1" />
          <stop offset="100%" style="stop-color:var(--color-accent);stop-opacity:0" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Labels -->
    <div class="chart-labels">
      <span class="label-start">{formatDate(data[0].date)}</span>
      <span class="label-end">{formatDate(data[data.length - 1].date)}</span>
    </div>
  {:else}
    <div class="no-data">No activity data available</div>
  {/if}
</div>

<style>
  .chart-wrapper {
    width: 100%;
    position: relative;
  }

  .chart {
    width: 100%;
    height: auto;
  }

  .data-point {
    cursor: pointer;
    transition: r 0.2s;
  }

  .data-point:hover {
    r: 6;
  }

  .chart-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .no-data {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
  }
</style>
