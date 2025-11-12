<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { ListWithCardCount } from '@kana/db-services';

  let { data } = $props();

  let lists: ListWithCardCount[] = $state([]);
  let filteredLists = $derived(
    lists.filter(list => {
      const matchesSearch = !searchQuery ||
        list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (list.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'public' && list.is_public) ||
        (filterType === 'example' && list.is_example) ||
        (filterType === 'user' && list.user_id !== null);

      return matchesSearch && matchesFilter;
    })
  );

  let searchQuery = $state("");
  let filterType = $state<'all' | 'public' | 'example' | 'user'>('all');
  let loading = $state(true);
  let error = $state<string | null>(null);
  let processingIds = $state<Set<string>>(new Set());

  onMount(() => {
    loadLists();
  });

  async function loadLists() {
    loading = true;
    error = null;

    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.set('filter', filterType);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const response = await fetch(`/api/lists?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch lists');
      }

      lists = await response.json();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
      console.error('Error loading lists:', e);
    } finally {
      loading = false;
    }
  }

  async function performAction(listId: string, action: string, confirmMessage?: string) {
    if (confirmMessage && !confirm(confirmMessage)) {
      return;
    }

    processingIds = new Set([...processingIds, listId]);

    try {
      const url = action === 'delete'
        ? `/api/lists/${listId}`
        : `/api/lists/${listId}/${action}`;

      const response = await fetch(url, {
        method: action === 'delete' ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} list`);
      }

      await loadLists();
    } catch (e) {
      alert(e instanceof Error ? e.message : `Failed to ${action} list`);
      console.error(`Error ${action}ing list:`, e);
    } finally {
      processingIds.delete(listId);
      processingIds = new Set(processingIds);
    }
  }

  function handlePublish(listId: string) {
    performAction(listId, 'publish');
  }

  function handleUnpublish(listId: string) {
    performAction(listId, 'unpublish', 'Make this list private?');
  }

  function handlePromote(listId: string) {
    performAction(listId, 'promote', 'Promote this list to example status? It will also become public.');
  }

  function handleUnpromote(listId: string) {
    performAction(listId, 'unpromote', 'Remove example status from this list?');
  }

  function handleDelete(listId: string) {
    const list = lists.find(l => l.id === listId);
    const listName = list?.name ?? 'this list';
    performAction(listId, 'delete', `Are you sure you want to delete "${listName}"? This cannot be undone.`);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  function getCardCount(list: ListWithCardCount): number {
    return list.cards?.[0]?.count ?? 0;
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
</script>

<svelte:head>
  <title>Admin Dashboard - Kana</title>
</svelte:head>

<div class="container">
  <header class="header">
    <div class="header-content">
      <h1>Kana Admin Dashboard</h1>
      <button class="sign-out-btn" onclick={signOut}>Sign Out</button>
    </div>
  </header>

  <div class="controls">
    <input
      type="text"
      bind:value={searchQuery}
      onchange={() => loadLists()}
      placeholder="Search lists..."
      class="search-input"
    />

    <div class="filters">
      <button
        class="filter-btn"
        class:active={filterType === 'all'}
        onclick={() => { filterType = 'all'; loadLists(); }}
      >
        All Lists ({lists.length})
      </button>
      <button
        class="filter-btn"
        class:active={filterType === 'example'}
        onclick={() => { filterType = 'example'; loadLists(); }}
      >
        Example Lists
      </button>
      <button
        class="filter-btn"
        class:active={filterType === 'public'}
        onclick={() => { filterType = 'public'; loadLists(); }}
      >
        Public Lists
      </button>
      <button
        class="filter-btn"
        class:active={filterType === 'user'}
        onclick={() => { filterType = 'user'; loadLists(); }}
      >
        User Lists
      </button>
    </div>
  </div>

  {#if loading}
    <div class="loading">Loading lists...</div>
  {:else if error}
    <div class="error">Error: {error}</div>
  {:else if filteredLists.length === 0}
    <div class="empty">No lists found</div>
  {:else}
    <div class="table-container">
      <table class="lists-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Owner</th>
            <th>Cards</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredLists as list (list.id)}
            <tr>
              <td class="list-name">{list.name}</td>
              <td class="description">{list.description ?? '—'}</td>
              <td class="owner">
                {list.user_id ? list.user_id.substring(0, 8) + '...' : 'System'}
              </td>
              <td class="card-count">{getCardCount(list)}</td>
              <td class="status">
                <div class="badges">
                  {#if list.is_example}
                    <span class="badge example">Example</span>
                  {/if}
                  {#if list.is_public}
                    <span class="badge public">Public</span>
                  {/if}
                  {#if list.is_test_data}
                    <span class="badge test">Test</span>
                  {/if}
                </div>
              </td>
              <td class="created">{formatDate(list.created_at)}</td>
              <td class="actions">
                <div class="action-buttons">
                  {#if !list.is_example}
                    <button
                      class="action-btn promote"
                      onclick={() => handlePromote(list.id)}
                      disabled={processingIds.has(list.id)}
                      title="Promote to example"
                    >
                      ⭐
                    </button>
                  {:else}
                    <button
                      class="action-btn unpromote"
                      onclick={() => handleUnpromote(list.id)}
                      disabled={processingIds.has(list.id)}
                      title="Remove example status"
                    >
                      ✖
                    </button>
                  {/if}

                  {#if !list.is_public}
                    <button
                      class="action-btn publish"
                      onclick={() => handlePublish(list.id)}
                      disabled={processingIds.has(list.id)}
                      title="Make public"
                    >
                      🌐
                    </button>
                  {:else}
                    <button
                      class="action-btn unpublish"
                      onclick={() => handleUnpublish(list.id)}
                      disabled={processingIds.has(list.id)}
                      title="Make private"
                    >
                      🔒
                    </button>
                  {/if}

                  <button
                    class="action-btn delete"
                    onclick={() => handleDelete(list.id)}
                    disabled={processingIds.has(list.id)}
                    title="Delete list"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
  }

  .sign-out-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .sign-out-btn:hover {
    background: var(--border-color);
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .search-input {
    width: 100%;
    max-width: 400px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent-color);
  }

  .filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-btn:hover {
    background: var(--bg-tertiary);
  }

  .filter-btn.active {
    background: var(--accent-color);
    border-color: var(--accent-color);
    color: white;
  }

  .table-container {
    overflow-x: auto;
    border-radius: 12px;
    border: 2px solid var(--border-color);
  }

  .lists-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--bg-secondary);
  }

  .lists-table th {
    text-align: left;
    padding: 1rem;
    font-weight: 600;
    border-bottom: 2px solid var(--border-color);
    background: var(--bg-tertiary);
    position: sticky;
    top: 0;
  }

  .lists-table td {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .lists-table tr:last-child td {
    border-bottom: none;
  }

  .lists-table tbody tr:hover {
    background: var(--bg-tertiary);
  }

  .list-name {
    font-weight: 500;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .description {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .owner {
    font-family: monospace;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .card-count {
    font-weight: 500;
  }

  .badges {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 4px;
    font-weight: 500;
  }

  .badge.example {
    background: #fbbf24;
    color: #78350f;
  }

  .badge.public {
    background: #34d399;
    color: #064e3b;
  }

  .badge.test {
    background: #94a3b8;
    color: #1e293b;
  }

  .created {
    font-size: 0.875rem;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-primary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover:not(:disabled) {
    transform: scale(1.1);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-btn.delete:hover:not(:disabled) {
    background: #fee;
  }

  .loading,
  .error,
  .empty {
    padding: 2rem;
    text-align: center;
    font-size: 1.125rem;
    color: var(--text-secondary);
  }

  .error {
    color: var(--error-color);
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .header h1 {
      font-size: 1.5rem;
    }

    .table-container {
      font-size: 0.875rem;
    }

    .lists-table th,
    .lists-table td {
      padding: 0.5rem;
    }

    .description,
    .owner {
      display: none;
    }
  }
</style>
