<script lang="ts">
  import type { CustomFlashCard } from "$lib/types/customLists";

  export let previewCards: CustomFlashCard[];
</script>

{#if previewCards.length > 0}
  <div class="preview">
    <p class="preview-label">Forhåndsvisning:</p>
    <div class="preview-cards">
      {#each previewCards as card (card.id)}
        <div class="preview-card">
          <div class="preview-front">{card.front}</div>
          <span class="arrow">→</span>
          <div class="preview-back">{card.back}</div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .preview {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--color-background, #f5f5f5);
    border-radius: 8px;
  }

  .preview-label {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #666);
    font-weight: 500;
    text-transform: uppercase;
  }

  .preview-cards {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .preview-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    padding: 0.5rem;
    background: white;
    border-radius: 6px;
    border-left: 3px solid var(--color-accent, #395c6b);
  }

  .preview-front {
    font-weight: 600;
    min-width: 3rem;
    text-align: right;
  }

  .arrow {
    color: var(--color-text-secondary, #999);
    font-size: 0.75rem;
  }

  .preview-back {
    color: var(--color-text-secondary, #666);
    flex: 1;
  }

  @media (max-width: 768px) {
    .preview-card {
      flex-wrap: wrap;
    }
  }
</style>
