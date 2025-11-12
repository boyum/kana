<svelte:options runes={true} />

<script lang="ts">
  import type { ShuffleMode } from "$lib/utils/smartShuffle";

  interface Props {
    shuffleMode?: ShuffleMode;
    enableSmartShuffle?: boolean;
  }

  let { shuffleMode = $bindable("balanced"), enableSmartShuffle = $bindable(true) }: Props = $props();

  const shuffleModes: Array<{
    value: ShuffleMode;
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      value: "balanced",
      label: "Balansert",
      icon: "⚖️",
      description: "Blanding av lette og vanskelige kort",
    },
    {
      value: "mastery-focused",
      label: "Mestring fokusert",
      icon: "🧠",
      description: "Fokus på kort du behersker godt",
    },
    {
      value: "challenge-first",
      label: "Utfordring først",
      icon: "⚙️",
      description: "Fokus på vanskelige kort",
    },
  ];

  function handleShuffleModeChange(mode: ShuffleMode) {
    shuffleMode = mode;
  }

  function toggleSmartShuffle() {
    enableSmartShuffle = !enableSmartShuffle;
  }
</script>

<div class="shuffle-selector-container">
  <div class="shuffle-toggle">
    <label>
      <input type="checkbox" bind:checked={enableSmartShuffle} />
      <span>🔀 Smart stokking</span>
    </label>
  </div>

  {#if enableSmartShuffle}
    <div class="shuffle-modes">
      <p class="label">Velg stokking-modus:</p>
      <div class="modes-grid">
        {#each shuffleModes as mode}
          <button
            class="mode-btn"
            class:active={shuffleMode === mode.value}
            onclick={() => handleShuffleModeChange(mode.value)}
            title={mode.description}
          >
            <span class="icon">{mode.icon}</span>
            <span class="text">{mode.label}</span>
          </button>
        {/each}
      </div>
      <p class="description">
        {shuffleModes.find((m) => m.value === shuffleMode)?.description}
      </p>
    </div>
  {/if}
</div>

<style>
  .shuffle-selector-container {
    width: 100%;
    max-width: 800px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    border: 2px solid rgba(57, 92, 107, 0.2);
  }

  .shuffle-toggle {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .shuffle-toggle label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.1rem;
    font-family: var(--font-heading);
    cursor: pointer;
    user-select: none;
  }

  .shuffle-toggle input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: var(--color-accent);
  }

  .label {
    font-size: 0.95rem;
    color: var(--color-heading);
    font-family: var(--font-heading);
    margin: 0 0 0.75rem 0;
    font-weight: 600;
  }

  .modes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .mode-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: white;
    border: 2px solid rgba(57, 92, 107, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-heading);
    font-size: 0.9rem;
  }

  .mode-btn:hover {
    border-color: var(--color-accent);
    background: rgba(128, 164, 237, 0.1);
  }

  .mode-btn.active {
    background: var(--color-accent);
    color: white;
    border-color: var(--color-accent);
    box-shadow: 0 4px 12px rgba(57, 92, 107, 0.2);
  }

  .mode-btn .icon {
    font-size: 1.5rem;
  }

  .mode-btn .text {
    font-size: 0.85rem;
    text-align: center;
    font-weight: 500;
  }

  .description {
    font-size: 0.9rem;
    color: var(--color-heading);
    margin: 0;
    font-style: italic;
    text-align: center;
    opacity: 0.8;
  }

  @media (max-width: 600px) {
    .shuffle-selector-container {
      padding: 1rem;
      margin-bottom: 0.5rem;
    }

    .modes-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .mode-btn {
      flex-direction: row;
      justify-content: flex-start;
      gap: 1rem;
    }

    .mode-btn .text {
      text-align: left;
    }
  }
</style>
