<svelte:options runes={true} />

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ListPage from '$lib/components/ListPage.svelte';
	import { getCustomList } from '$lib/utils/storage';
	import type { CustomList, CustomFlashCard } from '$lib/types/customLists';
	import * as m from '$lib/paraglide/messages';

	let combinedCards: CustomFlashCard[] = $state([]);
	let combinedTitle = $state('');
	let direction: 'front-to-back' | 'back-to-front' = $state('front-to-back');
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Store mapping of card IDs to their original list IDs for performance tracking
	let cardToListMap = $state<Map<string, string>>(new Map());

	onMount(() => {
		loadCombinedLists();
	});

	function loadCombinedLists() {
		try {
			// Get list IDs from URL params
			const urlParams = new URLSearchParams(window.location.search);
			const idsParam = urlParams.get('ids');

			if (!idsParam) {
				error = m.no_lists_selected();
				goto('/egendefinert');
				return;
			}

			const listIds = idsParam.split(',').filter(id => id.trim());

			if (listIds.length < 2) {
				error = m.select_at_least_2();
				goto('/egendefinert');
				return;
			}

			// Load all selected lists
			const lists: CustomList[] = [];
			const listNames: string[] = [];

			for (const listId of listIds) {
				const list = getCustomList(listId.trim());
				if (list && list.cards.length > 0) {
					lists.push(list);
					listNames.push(list.name);
				}
			}

			if (lists.length === 0) {
				error = m.no_valid_lists_found();
				goto('/egendefinert');
				return;
			}

			// Combine all cards from selected lists
			const allCards: CustomFlashCard[] = [];
			const newCardToListMap = new Map<string, string>();

			lists.forEach(list => {
				list.cards.forEach(card => {
					allCards.push(card);
					newCardToListMap.set(card.id, list.id);
				});
			});

			// Set combined data
			combinedCards = allCards;
			cardToListMap = newCardToListMap;
			combinedTitle = listNames.join(' + ');

			// Use first list's default direction, or default to front-to-back
			direction = lists[0].defaultDirection || 'front-to-back';

			isLoading = false;
		} catch (err) {
			console.error('Failed to load combined lists:', err);
			error = m.could_not_load_lists();
			setTimeout(() => goto('/egendefinert'), 2000);
		}
	}
</script>

<svelte:head>
	<title>{combinedTitle || m.combined_lists()}</title>
</svelte:head>

{#if isLoading}
	<div class="loading">
		<p>{m.loading_lists()}</p>
	</div>
{:else if error}
	<div class="error">
		<p>❌ {error}</p>
	</div>
{:else}
	<ListPage
		title={combinedTitle}
		cards={combinedCards}
		backUrl="/egendefinert"
		backText={`← ${m.back()}`}
		initialDirection={direction}
	/>
{/if}

<style>
	.loading,
	.error {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		text-align: center;
		padding: 4rem 2rem;
	}

	.loading p,
	.error p {
		font-size: 1.5rem;
		color: var(--color-heading);
		font-family: var(--font-heading);
	}

	.error p {
		color: #ff5252;
	}
</style>
