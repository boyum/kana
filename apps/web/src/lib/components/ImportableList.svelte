<script lang="ts">
  import type { CustomList } from "$lib/types/customLists";

  export let list: CustomList;
  export let isImported: boolean = false;
  export let onImport: (list: CustomList) => void;

  function handleImport() {
    onImport(list);
  }

  const previewCards = list.cards.slice(0, 4);
</script>

<article class="importable-list">
  <div class="list-header">
    <h3>{list.name}</h3>
    {#if isImported}
      <span class="imported-badge">✓ Importert</span>
    {/if}
  </div>

  <div class="card-count">
    <span>{list.cards.length} kort</span>
  </div>

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

  <div class="actions">
    <button
      class="import-btn"
      on:click={handleImport}
      disabled={isImported}
    >
      {isImported ? "Allerede importert" : "Importer"}
    </button>
  </div>
</article>

<style>
  .importable-list {
    background: var(--color-surface, white);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .importable-list:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--color-accent, #395c6b);
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--color-heading);
  }

  .imported-badge {
    background: var(--color-success, #4caf50);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .card-count {
    color: var(--color-text-secondary, #666);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

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

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .import-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    background: var(--color-accent, #395c6b);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .import-btn:hover:not(:disabled) {
    background: var(--color-accent-dark, #2a3f4a);
    transform: translateY(-2px);
  }

  .import-btn:disabled {
    background: var(--color-text-secondary, #999);
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    .importable-list {
      padding: 1rem;
    }

    h3 {
      font-size: 1.1rem;
    }

    .preview-card {
      flex-wrap: wrap;
    }
  }
</style>
