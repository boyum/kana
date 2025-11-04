<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import type { CustomList } from "$lib/types/customLists";
  import {
    getAllCustomLists,
    deleteCustomList,
    duplicateCustomList,
    exportList,
  } from "$lib/utils/storage";
  import { decodeShareToken } from "$lib/utils/sharing";
  import { saveCustomList } from "$lib/utils/storage";
  import ShareDialog from "$lib/components/ShareDialog.svelte";

  export let data;

  let lists: CustomList[] = [];
  let searchQuery = "";
  let showImportDialog = false;
  let showShareDialog = false;
  let shareList: CustomList | null = null;
  let importToken = "";
  let importError = "";
  let importSuccess = false;
  let isImporting = false;

  onMount(() => {
    loadLists();
    checkForImportToken();
  });

  function loadLists() {
    lists = getAllCustomLists();
  }

  async function checkForImportToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("import");

    if (token) {
      importToken = token;
      showImportDialog = true;
      await handleImport();
    }
  }

  function createNewList() {
    goto("/custom/new");
  }

  function editList(listId: string) {
    goto(`/custom/${listId}/edit`);
  }

  function practiceList(listId: string) {
    goto(`/custom/${listId}`);
  }

  async function handleDelete(listId: string) {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    if (confirm(`Er du sikker på at du vil slette "${list.name}"?`)) {
      try {
        deleteCustomList(listId);
        loadLists();
      } catch (error) {
        alert("Kunne ikke slette liste");
      }
    }
  }

  async function handleDuplicate(listId: string) {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    const newName = prompt("Navn på ny liste:", `${list.name} (kopi)`);
    if (!newName) return;

    try {
      duplicateCustomList(listId, newName);
      loadLists();
    } catch (error) {
      alert("Kunne ikke duplisere liste");
    }
  }

  async function handleExport(listId: string) {
    try {
      const jsonString = exportList(listId);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kana-list-${listId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Kunne ikke eksportere liste");
    }
  }

  function openShareDialog(listId: string) {
    const list = lists.find((l) => l.id === listId);
    if (list) {
      shareList = list;
      showShareDialog = true;
    }
  }

  function closeShareDialog() {
    showShareDialog = false;
    shareList = null;
  }

  function openImportDialog() {
    showImportDialog = true;
    importToken = "";
    importError = "";
    importSuccess = false;
  }

  function closeImportDialog() {
    showImportDialog = false;
    importToken = "";
    importError = "";
    importSuccess = false;

    // Remove import parameter from URL
    if (window.location.search.includes("import=")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("import");
      window.history.replaceState({}, "", url.toString());
    }
  }

  async function handleImport() {
    if (!importToken.trim()) {
      importError = "Vennligst lim inn en delingskode";
      return;
    }

    isImporting = true;
    importError = "";
    importSuccess = false;

    try {
      const list = await decodeShareToken(importToken.trim());

      // Check if we need to rename
      const existingNames = lists.map((l) => l.name);
      if (existingNames.includes(list.name)) {
        list.name = `${list.name} (importert)`;
      }

      saveCustomList(list);
      loadLists();
      importSuccess = true;

      setTimeout(() => {
        closeImportDialog();
      }, 2000);
    } catch (error) {
      importError =
        error instanceof Error ? error.message : "Kunne ikke importere liste";
    } finally {
      isImporting = false;
    }
  }

  $: filteredLists = lists.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("nb-NO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  function getTypeEmoji(type: string): string {
    switch (type) {
      case "hiragana":
        return "あ";
      case "katakana":
        return "ア";
      case "mixed":
        return "あア";
      default:
        return "📚";
    }
  }
</script>

<svelte:head>
  <title>Egendefinerte lister</title>
</svelte:head>

<div class="container">
  <header>
    <a href="/" class="back-btn">← Tilbake</a>
    <h1>✨ Egendefinerte lister</h1>
  </header>

  <div class="toolbar">
    <button class="create-btn" on:click={createNewList}>
      ➕ Opprett ny liste
    </button>
  </div>

  {#if lists.length > 0}
    <div class="search-bar">
      <label for="search" class="visually-hidden">Søk etter lister</label>
      <input
        id="search"
        type="text"
        bind:value={searchQuery}
        class="search-input"
        placeholder="🔍 Søk etter lister"
      />
    </div>
  {/if}

  {#if filteredLists.length === 0 && lists.length === 0}
    <div class="empty-state">
      <p class="empty-icon">📚</p>
      <p class="empty-text">Du har ingen egendefinerte lister ennå</p>
      <p class="empty-hint">Opprett din første liste for å komme i gang!</p>
    </div>
  {:else if filteredLists.length === 0}
    <div class="empty-state">
      <p class="empty-icon">🔍</p>
      <p class="empty-text">Ingen lister funnet</p>
    </div>
  {:else}
    <div class="lists-grid">
      {#each filteredLists as list (list.id)}
        <div class="list-card">
          <div class="list-header">
            <span class="list-icon">{getTypeEmoji(list.type)}</span>
            <h2 class="list-name">{list.name}</h2>
          </div>
          <div class="list-info">
            <p class="card-count">{list.cards.length} kort</p>
            <p class="last-updated">Oppdatert: {formatDate(list.updatedAt)}</p>
          </div>
          <div class="list-actions">
            <button
              class="action-btn practice"
              on:click={() => practiceList(list.id)}
            >
              🎯 Øv
            </button>
            <button class="action-btn edit" on:click={() => editList(list.id)}>
              ✏️ Rediger
            </button>
            <button
              class="action-btn share"
              on:click={() => openShareDialog(list.id)}
            >
              🔗 Del
            </button>
            <button
              class="action-btn duplicate"
              on:click={() => handleDuplicate(list.id)}
            >
              📋 Dupliser
            </button>
            <button
              class="action-btn export"
              on:click={() => handleExport(list.id)}
            >
              💾 Eksporter
            </button>
            <button
              class="action-btn delete"
              on:click={() => handleDelete(list.id)}
            >
              🗑️ Slett
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showImportDialog}
  <div
    class="modal-overlay"
    on:click={closeImportDialog}
    role="dialog"
    aria-modal="true"
  >
    <div class="modal" on:click|stopPropagation role="document">
      <h2>📥 Importer liste</h2>
      <p class="modal-instruction">Lim inn delingskoden du har mottatt:</p>

      <textarea
        bind:value={importToken}
        placeholder="Lim inn delingskode her..."
        class="import-textarea"
        rows="6"
      ></textarea>

      {#if importError}
        <p class="error-message">❌ {importError}</p>
      {/if}

      {#if importSuccess}
        <p class="success-message">✅ Liste importert!</p>
      {/if}

      <div class="modal-actions">
        <button
          class="cancel-btn"
          on:click={closeImportDialog}
          disabled={isImporting}
        >
          Avbryt
        </button>
        <button
          class="confirm-btn"
          on:click={handleImport}
          disabled={isImporting || !importToken.trim()}
        >
          {isImporting ? "Importerer..." : "Importer"}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showShareDialog && shareList}
  <ShareDialog list={shareList} onClose={closeShareDialog} />
{/if}

<style>
  .container {
    --container-padding: 3rem;
    min-height: calc(100dvh - (2 * var(--container-padding)));
    padding: var(--container-padding);
    max-width: 1200px;
    margin: 0 auto;
    width: 90%;
  }

  header {
    align-items: flex-start;
    display: flex;
    gap: 1.5rem;
    flex-direction: column;
    margin-bottom: 2rem;
    position: relative;
    text-align: center;
  }

  .back-btn {
    transform: translateY(-50%);
    padding: 0.5rem 1rem;
    background: var(--color-accent);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-family: var(--font-heading);
    font-size: 0.875rem;
    transition: all 0.3s ease;
  }

  .back-btn:hover {
    background: var(--color-heading);
    transform: translateY(-50%) scale(1.05);
  }

  h1 {
    font-family: var(--font-heading);
    font-size: 3rem;
    color: var(--color-heading);
    margin: 0;
  }

  .toolbar {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin: 2rem 0;
  }

  .create-btn,
  .import-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
    font-family: var(--font-heading);
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(57, 92, 107, 0.2);
  }

  .create-btn {
    background: var(--color-accent);
    color: white;
  }

  .create-btn:hover {
    background: var(--color-heading);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(57, 92, 107, 0.3);
  }

  .import-btn {
    background: var(--color-heading);
    color: white;
  }

  .import-btn:hover {
    background: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(57, 92, 107, 0.3);
  }

  .search-bar {
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .search-input {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    border: 3px solid var(--color-accent);
    border-radius: 30px;
    outline: none;
    transition: all 0.3s ease;
    font-family: var(--font-body);
  }

  .search-input:focus {
    border-color: var(--color-heading);
    box-shadow: 0 0 0 3px rgba(57, 92, 107, 0.1);
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-text {
    font-size: 1.5rem;
    color: var(--color-heading);
    font-family: var(--font-heading);
    margin-bottom: 0.5rem;
  }

  .empty-hint {
    font-size: 1.1rem;
    color: var(--color-text);
  }

  .lists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }

  .list-card {
    background: white;
    border-radius: 30px;
    padding: 1.5rem;
    box-shadow: 0 8px 20px rgba(57, 92, 107, 0.15);
    transition: all 0.3s ease;
    border: 3px solid transparent;
  }

  .list-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(57, 92, 107, 0.25);
    border-color: var(--color-accent);
  }

  .list-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .list-icon {
    font-size: 2rem;
  }

  .list-name {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    color: var(--color-heading);
    margin: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-info {
    margin-bottom: 1rem;
    color: var(--color-text);
  }

  .card-count {
    font-size: 1.1rem;
    font-weight: bold;
    margin: 0.25rem 0;
  }

  .last-updated {
    font-size: 0.9rem;
    margin: 0.25rem 0;
    opacity: 0.7;
  }

  .list-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    font-family: var(--font-body);
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 100px;
  }

  .action-btn.practice {
    background: var(--color-accent);
    color: white;
  }

  .action-btn.practice:hover {
    background: #6b8fd6;
  }

  .action-btn.edit {
    background: var(--color-heading);
    color: white;
  }

  .action-btn.edit:hover {
    background: #2a4654;
  }

  .action-btn.share {
    background: #4caf50;
    color: white;
  }

  .action-btn.share:hover {
    background: #45a049;
  }

  .action-btn.duplicate,
  .action-btn.export {
    background: #e6e1c5;
    color: var(--color-heading);
  }

  .action-btn.duplicate:hover,
  .action-btn.export:hover {
    background: #d4cfb8;
  }

  .action-btn.delete {
    background: #ff6b6b;
    color: white;
  }

  .action-btn.delete:hover {
    background: #ff5252;
  }

  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: white;
    border-radius: 30px;
    padding: 2rem;
    max-width: 600px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal h2 {
    font-family: var(--font-heading);
    color: var(--color-heading);
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .modal-instruction {
    margin-bottom: 1rem;
    color: var(--color-text);
  }

  .import-textarea {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    font-family: var(--font-mono);
    border: 2px solid var(--color-accent);
    border-radius: 15px;
    resize: vertical;
    outline: none;
    margin-bottom: 1rem;
  }

  .import-textarea:focus {
    border-color: var(--color-heading);
  }

  .error-message {
    color: #ff5252;
    font-weight: bold;
    margin: 0.5rem 0;
  }

  .success-message {
    color: #4caf50;
    font-weight: bold;
    margin: 0.5rem 0;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .cancel-btn,
  .confirm-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-family: var(--font-heading);
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cancel-btn {
    background: #ddd;
    color: #333;
  }

  .cancel-btn:hover:not(:disabled) {
    background: #ccc;
  }

  .confirm-btn {
    background: var(--color-accent);
    color: white;
  }

  .confirm-btn:hover:not(:disabled) {
    background: var(--color-heading);
  }

  .confirm-btn:disabled,
  .cancel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .container {
      --container-padding: 1rem;
    }

    h1 {
      font-size: 2rem;
    }

    .back-btn {
      position: static;
      transform: none;
      display: inline-block;
      margin-bottom: 1rem;
    }

    header {
      text-align: left;
    }

    .lists-grid {
      grid-template-columns: 1fr;
    }

    .list-actions {
      flex-direction: column;
    }

    .action-btn {
      min-width: auto;
    }
  }
</style>
