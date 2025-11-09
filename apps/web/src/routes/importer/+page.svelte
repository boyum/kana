<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import type { CustomList } from "$lib/types/customLists";
  import { getAllCustomLists, addList } from "$lib/utils/storage";
  import ImportableList from "$lib/components/ImportableList.svelte";
  import { exampleLists } from "$lib/data/exampleLists.js";
  import BackButton from "$lib/components/BackButton.svelte";

  let importedListNames: Set<string> = new Set();
  let searchQuery = "";
  let showImportDialog = false;
  let selectedListForImport: CustomList | null = null;
  let successMessage = "";
  let errorMessage = "";
  let isImporting = false;

  onMount(() => {
    updateImportedListNames();
  });

  function updateImportedListNames() {
    const userLists = getAllCustomLists();
    importedListNames = new Set(userLists.map(list => list.name));
  }

  function getFilteredLists(): CustomList[] {
    if (!searchQuery.trim()) {
      return exampleLists;
    }

    const query = searchQuery.toLowerCase();
    return exampleLists.filter(
      list =>
        list.name.toLowerCase().includes(query) ||
        list.cards.some(
          card =>
            card.front.toLowerCase().includes(query) ||
            card.back.toLowerCase().includes(query),
        ),
    );
  }

  function showImportConfirmation(list: CustomList) {
    selectedListForImport = list;
    showImportDialog = true;
  }

  async function confirmImport() {
    if (!selectedListForImport) return;

    isImporting = true;
    errorMessage = "";
    successMessage = "";

    try {
      if (importedListNames.has(selectedListForImport.name)) {
        const userChoice = await askForDuplicateAction(
          selectedListForImport.name,
        );

        if (userChoice === "rename") {
          const newName = prompt(
            "Nytt navn for listen:",
            `${selectedListForImport.name} (2)`,
          );
          if (!newName) {
            isImporting = false;
            return;
          }
          selectedListForImport.name = newName;
        } else if (userChoice === "cancel") {
          isImporting = false;
          return;
        }
      }

      const importedList = addList(selectedListForImport);
      updateImportedListNames();
      successMessage = `"${selectedListForImport.name}" er nå importert!`;

      setTimeout(() => {
        showImportDialog = false;
        selectedListForImport = null;
        successMessage = "";
      }, 2000);
    } catch (error) {
      console.error("Failed to import list:", error);
      errorMessage = "Kunne ikke importere listen. Prøv igjen.";
    } finally {
      isImporting = false;
    }
  }

  async function askForDuplicateAction(name: string): Promise<string> {
    const choice = confirm(
      `En liste med navn "${name}" finnes allerede.\n\nVelg OK for å gi den nytt navn, eller Avbryt for å hoppe over.`,
    );
    return choice ? "rename" : "cancel";
  }

  function cancelImport() {
    showImportDialog = false;
    selectedListForImport = null;
    errorMessage = "";
  }

  function goToCustomLists() {
    goto("/egendefinert");
  }
</script>

<svelte:head>
  <title>Importer Lister - Kana</title>
  <meta
    name="description"
    content="Importer eksempellister for å øve på flash cards"
  />
</svelte:head>

<div class="importer-container">
  <header class="importer-header">
    <BackButton url="/egendefinert" />
    <h1>Importer Lister</h1>
  </header>

  <section class="search-section">
    <input
      type="text"
      placeholder="Søk i lister..."
      class="search-input"
      bind:value={searchQuery}
    />
  </section>

  {#if getFilteredLists().length === 0}
    <div class="empty-state">
      <p>Ingen lister funnet.</p>
      {#if searchQuery.trim()}
        <p class="subtitle">Prøv med andre søkeord.</p>
      {/if}
    </div>
  {:else}
    <section class="lists-grid">
      {#each getFilteredLists() as exampleList (exampleList.id)}
        <ImportableList
          list={exampleList}
          isImported={importedListNames.has(exampleList.name)}
          onImport={() => showImportConfirmation(exampleList)}
        />
      {/each}
    </section>
  {/if}

  {#if showImportDialog && selectedListForImport}
    <div class="modal-overlay" role="presentation" on:click={cancelImport}>
      <div
        class="modal-content"
        role="alertdialog"
        aria-modal="true"
        tabindex="0"
        on:keydown|self={e => e.key === "Escape" && cancelImport()}
      >
        <h2>Importer "{selectedListForImport.name}"?</h2>
        <p class="modal-info">
          Denne listen inneholder {selectedListForImport.cards.length} kort.
        </p>

        {#if errorMessage}
          <div class="error-message">{errorMessage}</div>
        {/if}

        <div class="modal-actions">
          <button
            class="cancel-btn"
            on:click={cancelImport}
            disabled={isImporting}
          >
            Avbryt
          </button>
          <button
            class="confirm-btn"
            on:click={confirmImport}
            disabled={isImporting}
          >
            {isImporting ? "Importerer..." : "Importer"}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if successMessage}
    <div class="success-toast">
      ✓ {successMessage}
    </div>
  {/if}

  <section class="footer-section">
    <button class="my-lists-btn" on:click={goToCustomLists}>
      → Gå til mine lister
    </button>
  </section>
</div>

<style>
  .importer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
  }

  .importer-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  h1 {
    margin: 0;
    color: var(--color-heading);
    font-size: 2.5rem;
  }

  .search-section {
    margin-bottom: 2rem;
  }

  .search-input {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    border: 2px solid var(--color-border, #e0e0e0);
    border-radius: 8px;
    transition: border-color 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent, #395c6b);
  }

  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-text-secondary, #666);
  }

  .empty-state p {
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }

  .subtitle {
    font-size: 0.95rem;
  }

  .lists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .modal-content h2 {
    margin: 0 0 1rem 0;
    color: var(--color-heading);
  }

  .modal-info {
    color: var(--color-text-secondary, #666);
    margin: 1rem 0;
  }

  .error-message {
    background: #ffebee;
    color: #c62828;
    padding: 0.75rem;
    border-radius: 6px;
    margin: 1rem 0;
    font-size: 0.9rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .cancel-btn,
  .confirm-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cancel-btn {
    background: var(--color-text-secondary, #ddd);
    color: var(--color-text, #333);
  }

  .cancel-btn:hover:not(:disabled) {
    background: var(--color-border, #bbb);
  }

  .confirm-btn {
    background: var(--color-accent, #395c6b);
    color: white;
  }

  .confirm-btn:hover:not(:disabled) {
    background: var(--color-accent-dark, #2a3f4a);
  }

  .confirm-btn:disabled,
  .cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .success-toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--color-success, #4caf50);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 50;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .footer-section {
    text-align: center;
    padding: 2rem 0;
    border-top: 1px solid var(--color-border, #e0e0e0);
    margin-top: 3rem;
  }

  .my-lists-btn {
    padding: 1rem 2rem;
    background: var(--color-accent, #395c6b);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .my-lists-btn:hover {
    background: var(--color-accent-dark, #2a3f4a);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .importer-container {
      padding: 1rem;
    }

    .importer-header {
      flex-direction: column;
      align-items: flex-start;
    }

    h1 {
      font-size: 2rem;
    }

    .lists-grid {
      grid-template-columns: 1fr;
    }

    .modal-overlay {
      padding: 1rem;
    }
  }
</style>
