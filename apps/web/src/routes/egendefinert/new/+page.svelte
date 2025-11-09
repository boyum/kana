<script lang="ts">
  import { goto } from "$app/navigation";
  import ListEditor from "$lib/components/ListEditor.svelte";
  import { saveCustomList } from "$lib/utils/storage";
  import type { CustomList } from "$lib/types/customLists";
  import BackButton from "$lib/components/BackButton.svelte";

  function handleSave(list: CustomList) {
    saveCustomList(list);
    goto("/egendefinert");
  }

  function handleCancel() {
    goto("/egendefinert");
  }
</script>

<svelte:head>
  <title>Opprett ny liste</title>
</svelte:head>

<div class="container">
  <header>
    <BackButton url="/egendefinert" />
    <h1>➕ Opprett ny liste</h1>
  </header>

  <ListEditor list={null} onSave={handleSave} onCancel={handleCancel} />
</div>

<style>
  .container {
    --container-padding: 2rem;
    min-height: calc(100dvh - (2 * var(--container-padding)));
    padding: var(--container-padding);
    max-width: 1200px;
    margin: 0 auto;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
    position: relative;
  }

  h1 {
    font-family: var(--font-heading);
    font-size: 2.5rem;
    color: var(--color-heading);
    margin: 0;
  }

  @media (max-width: 768px) {
    .container {
      --container-padding: 1rem;
    }

    h1 {
      font-size: 1.8rem;
    }

    header {
      text-align: left;
    }
  }
</style>
