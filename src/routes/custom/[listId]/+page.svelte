<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ListPage from '$lib/components/ListPage.svelte';
	import { getCustomList } from '$lib/utils/storage';
	import type { CustomList } from '$lib/types/customLists';
	
	export let data: { listId: string };
	
	let list: CustomList | null = null;
	let direction: 'front-to-back' | 'back-to-front' = 'front-to-back';
	
	$: if (data.listId) {
		loadList();
	}
	
	function loadList() {
		list = getCustomList(data.listId);
		if (!list) {
			alert('Liste ikke funnet');
			goto('/custom');
			return;
		}
		direction = list.defaultDirection || 'front-to-back';
	}
</script>

{#if list}
	<ListPage
		title={list.name}
		cards={list.cards || []}
		backUrl="/custom"
		backText="← Tilbake"
		showTitle={true}
		showDirectionToggle={true}
		initialDirection={direction}
	/>
{:else}
	<div class="loading">
		<p>Laster liste...</p>
	</div>
{/if}

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		text-align: center;
		padding: 4rem 2rem;
	}
	
	.loading p {
		font-size: 1.5rem;
		color: var(--color-heading);
		font-family: var(--font-heading);
	}
</style>
