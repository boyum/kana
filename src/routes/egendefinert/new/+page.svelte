<script lang="ts">
  import { goto } from "$app/navigation";
  import ListEditor from "$lib/components/ListEditor.svelte";
  import { saveCustomList } from "$lib/utils/storage";
  import type { CustomList } from "$lib/types/customLists";
  import { handleLinkClick } from "$lib/utils/interaction";

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
    <a
      href="/egendefinert"
      class="back-btn"
      on:pointerdown={(e) => handleLinkClick(e, "/egendefinert", goto)}
    >
      ← Tilbake
    </a>
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

  .back-btn {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
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
    transform: translateY(-50%) scale(1.05);
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

    .back-btn {
      position: static;
      transform: none;
      display: inline-block;
      margin-bottom: 1rem;
    }

    header {
      text-align: left;
    }
  }
</style>
