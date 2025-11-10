<script lang="ts">
  import * as m from '$lib/paraglide/messages';

  interface Props {
    streak: number;
  }

  let { streak }: Props = $props();

  const getStreakMessage = (days: number): string => {
    if (days === 0) return 'Start your streak today!';
    if (days === 1) return 'day streak';
    return 'day streak';
  };
</script>

<div class="streak-display">
  <div class="streak-value">{streak}</div>
  <div class="streak-label">{getStreakMessage(streak)}</div>
</div>

<style>
  .streak-display {
    text-align: center;
  }

  .streak-value {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }

  .streak-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-top: 0.5rem;
  }
</style>
