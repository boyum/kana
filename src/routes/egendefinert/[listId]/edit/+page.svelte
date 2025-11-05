<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import ListEditor from "$lib/components/ListEditor.svelte";
  import { getCustomList, saveCustomList } from "$lib/utils/storage";
  import type { CustomList } from "$lib/types/customLists";
  import { handleLinkClick } from "$lib/utils/interaction";

  let listId: string = "";
  let list: CustomList | null = null;

  onMount(() => {
    if (!$page.params.listId) {
      alert("Ugyldig liste-ID");
      goto("/egendefinert");
      return;
    }

    listId = $page.params.listId;
    list = getCustomList(listId);

    if (!list) {
      alert("Liste ikke funnet");
      goto("/egendefinert");
    }
  });

  function handleSave(updatedList: CustomList) {
    saveCustomList(updatedList);
    goto("/egendefinert");
  }

  function handleCancel() {
    goto("/egendefinert");
  }
</script>

<svelte:head>
  <title>Rediger liste</title>
</svelte:head>

<div class="container">
  <header>
    <a
      href="/egendefinert"
      class="back-btn"
      on:pointerdown={e => handleLinkClick(e, "/egendefinert", goto)}
    >
      ← Tilbake
    </a>
    <h1>✏️ Rediger liste</h1>
  </header>

  {#if list}
    <ListEditor {list} onSave={handleSave} onCancel={handleCancel} />
  {:else}
    <p class="loading">Laster...</p>
  {/if}
</div>

<style>
  .container {
    --container-padding: 2rem;
    min-height: calc(100dvh - (2 * var(--container-padding)));
    padding: var(--container-padding);
    width: 100%;
    margin: 0 auto;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .back-btn {
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    background: var(--color-accent);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-family: var(--font-heading);
    font-size: 1.2rem;
    transition: all 0.3s ease;
  }

  .back-btn:hover {
    background: var(--color-heading);
    transform: scale(1.05);
  }

  h1 {
    font-family: var(--font-heading);
    font-size: 2.5rem;
    color: var(--color-heading);
    margin: 0;
  }

  .loading {
    text-align: center;
    font-size: 1.5rem;
    color: var(--color-heading);
    font-family: var(--font-heading);
    padding: 4rem;
  }

  @media (max-width: 768px) {
    .container {
      --container-padding: 1rem;
    }

    h1 {
      font-size: 1.8rem;
    }
  }
</style>
