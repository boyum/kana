<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import ListEditor from "$lib/components/ListEditor.svelte";
  import { getCustomList, saveCustomList } from "$lib/utils/storage";
  import type { CustomList } from "$lib/types/customLists";
  import { handleLinkClick } from "$lib/utils/interaction";
  import BackButton from "$lib/components/BackButton.svelte";
  import * as m from "$lib/paraglide/messages";

  let listId: string = "";
  let list: CustomList | null = null;

  onMount(() => {
    if (!$page.params.listId) {
      alert(m.invalid_list_id());
      goto("/egendefinert");
      return;
    }

    listId = $page.params.listId;
    list = getCustomList(listId);

    if (!list) {
      alert(m.list_not_found());
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
  <title>{m.edit_list()}</title>
</svelte:head>

<div class="container">
  <header>
    <BackButton url="/egendefinert" />
    <h1>✏️ {m.edit_list()}</h1>
  </header>

  {#if list}
    <ListEditor {list} onSave={handleSave} onCancel={handleCancel} />
  {:else}
    <p class="loading">{m.loading()}</p>
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
