<svelte:options runes={true} />

<script lang="ts">
  import type { CustomList } from "$lib/types/customLists";
  import ListPreview from "./ListPreview.svelte";

  interface Props {
    list: CustomList;
    isImported?: boolean;
    onImport: (list: CustomList) => void;
    onCancel?: () => void;
  }

  let { list, isImported = false, onImport, onCancel = () => {} }: Props = $props();

  const previewCards = list.cards.slice(0, 6);

  function handleImport() {
    onImport(list);
  }

  function handleCancel() {
    onCancel();
  }
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

  <ListPreview {previewCards} />

  <div class="actions">
    {#if handleCancel}
      <button class="cancel-btn" onclick={handleCancel}> Avbryt </button>
    {/if}

    <button class="import-btn" onclick={handleImport} disabled={isImported}>
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

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .cancel-btn,
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

  .cancel-btn:hover:not(:disabled),
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
  }
</style>
