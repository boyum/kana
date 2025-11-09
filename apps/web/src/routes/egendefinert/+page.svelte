<script lang="ts">
  import { goto, replaceState } from "$app/navigation";
  import BackButton from "$lib/components/BackButton.svelte";
  import CustomListComponent from "$lib/components/CustomList.svelte";
  import ImportableList from "$lib/components/ImportableList.svelte";
  import ShareDialog from "$lib/components/ShareDialog.svelte";
  import type { CustomList } from "$lib/types/customLists";
  import { addIndexToName } from "$lib/utils/addIndexToName";
  import { handleLinkClick } from "$lib/utils/interaction";
  import { decodeShareToken } from "$lib/utils/sharing";
  import {
    deleteCustomList,
    duplicateCustomList,
    exportList,
    getAllCustomLists,
    saveCustomList,
  } from "$lib/utils/storage";
  import { onMount } from "svelte";

  let lists: CustomList[] = $state([]);
  let searchQuery = $state("");
  let showShareDialog = $state(false);
  let shareList: CustomList | null = $state(null);
  let importError: string | null = $state(null);
  let importSuccess = $state(false);
  let isImporting = $state(false);

  let listFromSearchParam: CustomList | null = $state(null);
  let filteredLists = $derived(
    lists.filter(list =>
      list.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  onMount(() => {
    loadLists();
    checkForImportToken();
  });

  function loadLists() {
    lists = getAllCustomLists();
  }

  async function checkForImportToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("import")?.trim();

    if (token) {
      listFromSearchParam = await decodeShareToken(token);
    }
  }

  function createNewList() {
    goto("/egendefinert/new");
  }

  function editList(listId: string) {
    goto(`/egendefinert/${listId}/edit`);
  }

  function practiceList(listId: string) {
    goto(`/egendefinert/${listId}`);
  }

  async function handleDelete(listId: string) {
    const list = lists.find(l => l.id === listId);
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
    const list = lists.find(l => l.id === listId);
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
    const list = lists.find(l => l.id === listId);
    if (list) {
      shareList = list;
      showShareDialog = true;
    }
  }

  function closeShareDialog() {
    showShareDialog = false;
    shareList = null;
  }

  function closeImportDialog() {
    listFromSearchParam = null;

    // Remove import parameter from URL
    if (window.location.search.includes("import=")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("import");
      replaceState(url.toString(), {});
    }
  }

  async function handleImport() {
    if (listFromSearchParam == null) {
      return;
    }

    isImporting = true;
    importError = "";
    importSuccess = false;

    try {
      const existingNames = lists.map(l => l.name);

      listFromSearchParam.name = addIndexToName(
        existingNames,
        listFromSearchParam.name,
      );

      saveCustomList(listFromSearchParam);
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

  // Unified interaction handlers
  function createInteractionHandler(callback: () => void) {
    return (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          callback();
        }
      } else if (e instanceof PointerEvent && e.isPrimary) {
        e.preventDefault();
        callback();
      }
    };
  }
</script>

<svelte:head>
  <title>Egendefinerte lister</title>
</svelte:head>

<div class="container">
  <header>
    <BackButton />
    <h1>✨ Egendefinerte lister</h1>
  </header>

  <div class="toolbar">
    <button
      class="create-btn"
      onpointerdown={createInteractionHandler(createNewList)}
      onkeydown={createInteractionHandler(createNewList)}
    >
      ➕ Opprett ny liste
    </button>
    <a
      href="/importer"
      rel="prefetch"
      class="import-btn"
      onpointerdown={e => handleLinkClick(e, "/importer", goto)}
    >
      📚 Importer lister
    </a>
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
    <CustomListComponent
      lists={filteredLists}
      onPractice={practiceList}
      onEdit={editList}
      onShare={openShareDialog}
      onDuplicate={handleDuplicate}
      onExport={handleExport}
      onDelete={handleDelete}
    />
  {/if}
</div>

{#if listFromSearchParam}
  <div
    class="modal-overlay"
    onpointerdown={e => {
      if (e.target === e.currentTarget && e.isPrimary) {
        e.preventDefault();
        closeImportDialog();
      }
    }}
    onkeydown={e => {
      if (e.key === "Escape") {
        closeImportDialog();
      }
    }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <form
      class="modal"
      onpointerdown={e => e.stopPropagation()}
      onkeydown={e => e.stopPropagation()}
      role="document"
    >
      <h2>📥 Legg til en ny liste</h2>

      <ImportableList
        list={listFromSearchParam}
        onImport={handleImport}
        onCancel={closeImportDialog}
        isImported={isImporting}
      />

      {#if importError}
        <p class="error-message">❌ {importError}</p>
      {/if}

      {#if importSuccess}
        <p class="success-message">✅ Liste importert!</p>
      {/if}
    </form>
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
    width: calc(100% - 1rem);
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
    gap: 1rem;
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
    background: var(--color-accent);
    color: white;
    text-decoration: none;
    display: inline-block;
  }

  .create-btn:hover,
  .import-btn:hover {
    background: var(--color-heading);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(57, 92, 107, 0.3);
  }

  .import-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .import-btn:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
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

  @media (max-width: 768px) {
    .container {
      --container-padding: 1rem;
    }

    h1 {
      font-size: 2rem;
    }

    header {
      text-align: left;
    }
  }
</style>
