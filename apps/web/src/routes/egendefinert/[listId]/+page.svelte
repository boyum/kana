<svelte:options runes={true} />

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ListPage from '$lib/components/ListPage.svelte';
	import { getCustomList } from '$lib/utils/storage';
	import type { CustomList } from '$lib/types/customLists';

	interface Props {
		data: { listId: string };
	}

	let { data }: Props = $props();

	let list = $state<CustomList | null>(null);
	let direction = $state<'front-to-back' | 'back-to-front'>('front-to-back');

	onMount(() => {
		if (data.listId) {
			loadList();
		}
	});
	
	function loadList() {
		list = getCustomList(data.listId);
		if (!list) {
			alert('Liste ikke funnet');
			goto('/egendefinert');
			return;
		}
		direction = list.defaultDirection || 'front-to-back';
	}
</script>

{#if list}
	<ListPage
		title={list.name}
		cards={list.cards || []}
		backUrl="/egendefinert"
		backText="← Tilbake"
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
