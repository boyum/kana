<script lang="ts">
  import { onMount } from "svelte";
  import FlashCard from "$lib/components/FlashCard.svelte";
  import { hiraganaCharacters } from "$lib/data/kana";

  let currentIndex = 0;
  let isFlipped = false;
  let cards = [...hiraganaCharacters].sort(() => Math.random() - 0.5);

  $: currentCard = cards[currentIndex];
  $: progress = `${currentIndex + 1} / ${cards.length}`;

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

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") {
      nextCard();
    } else if (event.key === "ArrowLeft") {
      previousCard();
    } else if (event.key === " ") {
      event.preventDefault();
      isFlipped = !isFlipped;
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });
</script>

<svelte:head>
  <title>Hiragana - Kana</title>
</svelte:head>

<section>
  <div class="header">
    <a href="/" class="back-btn">← Hjem</a>
  </div>

  <div class="card-container">
    {#key currentIndex}
      <FlashCard
        character={currentCard.character}
        romanization={currentCard.romanization}
        bind:isFlipped
      />
    {/key}
  </div>

  <div class="controls">
    <button
      type="button"
      class="nav-btn"
      on:click={previousCard}
      disabled={currentIndex === 0}
    >
      ← Forrige
    </button>
    <span class="progress">{progress}</span>
    <button
      type="button"
      class="nav-btn"
      on:click={nextCard}
      disabled={currentIndex === cards.length - 1}
    >
      Neste →
    </button>
  </div>

  <p class="hint">Tips: Bruk piltastene eller mellomrom for å navigere</p>
</section>

<style>
  section {
    --section-padding: 2rem;
    min-height: calc(100dvh - (2 * var(--section-padding)));
    padding: var(--section-padding);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    max-width: 600px;
    gap: 1rem;
  }

  .back-btn {
    padding: 0.75rem 1.5rem;
    font-family: var(--font-heading);
    font-size: 1.25rem;
    background: var(--color-accent);
    color: white;
    border-radius: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 6px 15px rgba(57, 92, 107, 0.2);
    cursor: pointer;
    white-space: nowrap;
  }

  .back-btn:hover {
    background: var(--color-heading);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 25px rgba(57, 92, 107, 0.3);
  }

  .card-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 400px;
    min-height: 500px;
    padding: 1rem;
    position: relative;
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
    font-family: var(--font-heading);
    font-size: 1.5rem;
    background: var(--color-accent);
    color: white;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 6px 15px rgba(57, 92, 107, 0.2);
  }

  .nav-btn:hover:not(:disabled) {
    background: var(--color-heading);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 25px rgba(57, 92, 107, 0.3);
  }

  .nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .progress {
    font-size: 1.5rem;
    font-family: var(--font-heading);
    color: var(--color-heading);
    white-space: nowrap;
    text-align: center;
  }

  .hint {
    font-size: 0.9rem;
    color: var(--color-heading);
    opacity: 0.7;
    margin-top: 1rem;
  }

  @media (max-width: 720px) {
    section {
      --section-padding: 1rem;
    }

    .header {
      flex-wrap: wrap;
      gap: 0.5rem;
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
