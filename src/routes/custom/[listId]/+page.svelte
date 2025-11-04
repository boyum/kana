<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import FlashCard from '$lib/components/FlashCard.svelte';
	import { getCustomList } from '$lib/utils/storage';
	import type { CustomList, CustomFlashCard } from '$lib/types/customLists';
	
	export let data: { listId: string };
	
	let list: CustomList | null = null;
	let currentIndex = 0;
	let isFlipped = false;
	let direction: 'front-to-back' | 'back-to-front' = 'front-to-back';
	let shuffledCards: CustomFlashCard[] = [];
	
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
		shuffledCards = [...(list.cards || [])].sort(() => Math.random() - 0.5);
		currentIndex = 0;
		isFlipped = false;
	}
	
	$: cards = shuffledCards;
	$: currentCard = cards[currentIndex];
	$: progress = cards.length > 0 ? `${currentIndex + 1} / ${cards.length}` : '0 / 0';
	
	// Swap front and back based on direction
	$: frontContent = currentCard ? (direction === 'front-to-back' ? currentCard.front : currentCard.back) : '';
	$: backContent = currentCard ? (direction === 'front-to-back' ? currentCard.back : currentCard.front) : '';
	
	function nextCard() {
		if (currentIndex < cards.length - 1) {
			isFlipped = false;
			currentIndex++;
		}
	}
	
	function previousCard() {
		if (currentIndex > 0) {
			isFlipped = false;
			currentIndex--;
		}
	}
	
	function toggleDirection() {
		direction = direction === 'front-to-back' ? 'back-to-front' : 'front-to-back';
		isFlipped = false;
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') {
			nextCard();
		} else if (event.key === 'ArrowLeft') {
			previousCard();
		} else if (event.key === ' ') {
			event.preventDefault();
			isFlipped = !isFlipped;
		}
	}
	
	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<svelte:head>
	<title>{list?.name || 'Øv liste'}</title>
</svelte:head>

<section>
	{#if list}
		<div class="header">
			<a href="/custom" class="back-btn">← Tilbake</a>
			<h1>{list.name}</h1>
			<div class="header-actions">
				<button class="direction-btn" on:click={toggleDirection}>
					🔄 {direction === 'front-to-back' ? 'Forside → Bakside' : 'Bakside → Forside'}
				</button>
			</div>
		</div>
		
		{#if cards.length === 0}
			<div class="empty-state">
				<p>Denne listen har ingen kort ennå.</p>
				<a href="/custom/{list.id}/edit" class="edit-link">Rediger liste</a>
			</div>
		{:else}
			<div class="card-container">
				{#key currentIndex}
					<FlashCard 
						front={frontContent}
						back={backContent}
						meaning={currentCard.meaning}
						notes={currentCard.notes}
						bind:isFlipped
					/>
				{/key}
			</div>
			
			<div class="controls">
				<button class="nav-btn" on:click={previousCard} disabled={currentIndex === 0}>
					← Forrige
				</button>
				<span class="progress">{progress}</span>
				<button class="nav-btn" on:click={nextCard} disabled={currentIndex === cards.length - 1}>
					Neste →
				</button>
			</div>
		{/if}
	{:else}
		<div class="loading">
			<p>Laster liste...</p>
		</div>
	{/if}
</section>

<style>
	section {
		--section-padding: 2rem;
		padding: var(--section-padding);
		min-height: calc(100dvh - (2 * var(--section-padding)));
	}
	
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 3rem;
		flex-wrap: wrap;
		gap: 1rem;
	}
	
	.back-btn {
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
		color: var(--color-heading);
		font-size: 2.5rem;
		margin: 0;
		flex: 1;
		text-align: center;
	}
	
	.header-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	
	.direction-btn {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		font-family: var(--font-body);
		background: var(--color-heading);
		color: white;
		border: none;
		border-radius: 25px;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.direction-btn:hover {
		background: var(--color-accent);
		transform: scale(1.05);
	}
	
	.card-container {
		position: relative;
		height: 550px;
		margin-bottom: 3rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.controls {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2rem;
		padding: 1rem;
	}
	
	.nav-btn {
		padding: 1rem 2rem;
		font-size: 1.2rem;
		font-family: var(--font-heading);
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 30px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(57, 92, 107, 0.2);
	}
	
	.nav-btn:hover:not(:disabled) {
		background: var(--color-heading);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(57, 92, 107, 0.3);
	}
	
	.nav-btn:disabled {
		background: #ccc;
		cursor: not-allowed;
		opacity: 0.5;
	}
	
	.progress {
		font-size: 1.5rem;
		font-family: var(--font-heading);
		color: var(--color-heading);
		min-width: 100px;
		text-align: center;
	}
	
	.empty-state,
	.loading {
		text-align: center;
		padding: 4rem 2rem;
	}
	
	.empty-state p,
	.loading p {
		font-size: 1.5rem;
		color: var(--color-heading);
		font-family: var(--font-heading);
		margin-bottom: 1rem;
	}
	
	.edit-link {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: var(--color-accent);
		color: white;
		text-decoration: none;
		border-radius: 25px;
		font-family: var(--font-heading);
		font-size: 1.2rem;
		transition: all 0.3s ease;
	}
	
	.edit-link:hover {
		background: var(--color-heading);
		transform: scale(1.05);
	}
	
	@media (max-width: 768px) {
		section {
			--section-padding: 1rem;
		}
		
		.header {
			flex-direction: column;
			align-items: stretch;
		}
		
		h1 {
			font-size: 2rem;
			text-align: left;
		}
		
		.header-actions {
			flex-direction: column;
		}
		
		.direction-btn {
			width: 100%;
		}
		
		.card-container {
			height: 450px;
		}
		
    .controls {
      justify-content: space-between;
      gap: 0.5rem;
      width: 100%;
    }
		
		.progress {
			flex-grow: 1;
		}

    .nav-btn {
      width: 100%;
      max-width: 250px;
      padding: 0.5rem;
    }
	}
</style>
