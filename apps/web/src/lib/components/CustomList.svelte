<svelte:options runes={true} />

<script lang="ts">
  import type { CustomList } from "$lib/types/customLists";
  import CustomListItem from "$lib/components/CustomListItem.svelte";

  interface Props {
    lists?: CustomList[];
    onPractice: (listId: string) => void;
    onEdit: (listId: string) => void;
    onShare: (listId: string) => void;
    onDuplicate: (listId: string) => void;
    onExport: (listId: string) => void;
    onDelete: (listId: string) => void;
    multiSelectMode?: boolean;
    selectedListIds?: Set<string>;
  }

  let {
    lists = [],
    onPractice,
    onEdit,
    onShare,
    onDuplicate,
    onExport,
    onDelete,
    multiSelectMode = false,
    selectedListIds = new Set()
  }: Props = $props();
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