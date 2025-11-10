<script lang="ts">
  import type { CustomList } from "$lib/types/customLists";
  import CustomListItem from "$lib/components/CustomListItem.svelte";

  export let lists: CustomList[] = [];

  export let onPractice: (listId: string) => void;
  export let onEdit: (listId: string) => void;
  export let onShare: (listId: string) => void;
  export let onDuplicate: (listId: string) => void;
  export let onExport: (listId: string) => void;
  export let onDelete: (listId: string) => void;

  export let multiSelectMode: boolean = false;
  export let selectedListIds: Set<string> = new Set();
</script>

<div class="lists-grid">
  {#each lists as list (list.id)}
    <CustomListItem
      {list}
      onPractice={onPractice}
      onEdit={onEdit}
      onShare={onShare}
      onDuplicate={onDuplicate}
      onExport={onExport}
      onDelete={onDelete}
      multiSelectMode={multiSelectMode}
      isSelected={selectedListIds.has(list.id)}
    />
  {/each}
</div>

<style>
  .lists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }
</style>