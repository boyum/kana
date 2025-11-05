<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import FlashCard from "$lib/components/FlashCard.svelte";
  import type { CustomFlashCard } from "$lib/types/customLists";
  import { handleLinkClick } from "$lib/utils/interaction";

  // Props
  export let title: string;
  export let cards: Array<
    { character?: string; romanization?: string } | CustomFlashCard
  >;
  export let backUrl: string = "/";
  export let backText: string = "← Hjem";
  export let showDirectionToggle: boolean = false;
  export let initialDirection: "front-to-back" | "back-to-front" =
    "front-to-back";
  export let showTitle: boolean = false;
  export let additionalActions: Array<{ label: string; onClick: () => void }> =
    [];

  // State
  let currentIndex = 0;
  let isFlipped = false;
  let direction: "front-to-back" | "back-to-front" = initialDirection;
  let shuffledCards: typeof cards = [];
  let isTouchDevice = false;

  // Initialize shuffled cards
  $: shuffledCards = [...cards].sort(() => Math.random() - 0.5);

  // Computed values
  $: currentCard = shuffledCards[currentIndex];
  $: progress =
    shuffledCards.length > 0
      ? `${currentIndex + 1} / ${shuffledCards.length}`
      : "0 / 0";

  // Handle card content based on type and direction
  $: isCustomCard = currentCard && "front" in currentCard;
  $: frontContent = isCustomCard
    ? direction === "front-to-back"
      ? (currentCard as CustomFlashCard).front
      : (currentCard as CustomFlashCard).back
    : (currentCard as any)?.character || "";
  $: backContent = isCustomCard
    ? direction === "front-to-back"
      ? (currentCard as CustomFlashCard).back
      : (currentCard as CustomFlashCard).front
    : (currentCard as any)?.romanization || "";
  $: meaning = isCustomCard
    ? (currentCard as CustomFlashCard).meaning
    : undefined;
  $: notes = isCustomCard ? (currentCard as CustomFlashCard).notes : undefined;

  // Navigation functions
  function nextCard() {
    if (currentIndex < shuffledCards.length - 1) {
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
    direction =
      direction === "front-to-back" ? "back-to-front" : "front-to-back";
    isFlipped = false;
  }

  function restart() {
    isFlipped = false;
    currentIndex = 0;
    shuffledCards = [...cards].sort(() => Math.random() - 0.5);
  }

  // Unified interaction handlers
  function createInteractionHandler(callback: () => void) {
    return (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          callback();
        }
      } else if (e instanceof PointerEvent && e.isPrimary) {
        e.preventDefault();
        callback();
      }
    };
  }

  // Keyboard handler for global shortcuts
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
    // Detect if this is primarily a touch device
    isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // Check if coarse pointer (touch) is the primary input
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<section>
  <div class="header">
    <a
      href={backUrl}
      class="back-btn"
      on:pointerdown={(e) => handleLinkClick(e, backUrl, goto)}
    >
      {backText}
    </a>
    {#if showTitle}
      <h1>{title}</h1>
    {/if}
    {#if showDirectionToggle || additionalActions.length > 0}
      <div class="header-actions">
        {#if showDirectionToggle}
          <button
            class="action-btn"
            on:pointerdown={createInteractionHandler(toggleDirection)}
            on:keydown={createInteractionHandler(toggleDirection)}
          >
            🔄 {direction === "front-to-back"
              ? "Forside → Bakside"
              : "Bakside → Forside"}
          </button>
        {/if}
        {#each additionalActions as action}
          <button
            class="action-btn"
            on:pointerdown={createInteractionHandler(action.onClick)}
            on:keydown={createInteractionHandler(action.onClick)}
          >
            {action.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  {#if shuffledCards.length === 0}
    <div class="empty-state">
      <p>Ingen kort tilgjengelig</p>
    </div>
  {:else}
    <div class="card-container">
      {#key currentIndex}
        {#if isCustomCard}
          <FlashCard
            front={frontContent}
            back={backContent}
            {meaning}
            {notes}
            bind:isFlipped
          />
        {:else}
          <FlashCard
            character={frontContent}
            romanization={backContent}
            bind:isFlipped
          />
        {/if}
      {/key}
    </div>

    <div class="controls">
      <button
        type="button"
        class="nav-btn"
        on:pointerdown={createInteractionHandler(previousCard)}
        on:keydown={createInteractionHandler(previousCard)}
        disabled={currentIndex === 0}
      >
        ← Forrige
      </button>
      <span class="progress">{progress}</span>
      <button
        type="button"
        class="nav-btn"
        on:pointerdown={createInteractionHandler(currentIndex === shuffledCards.length - 1 ? restart : nextCard)}
        on:keydown={createInteractionHandler(currentIndex === shuffledCards.length - 1 ? restart : nextCard)}
      >
        {currentIndex === shuffledCards.length - 1 ? 'Igjen 🔄' : 'Neste →'}
      </button>
    </div>

    {#if !isTouchDevice}
      <p class="hint">Tips: Bruk piltastene eller mellomrom for å navigere</p>
    {/if}
  {/if}
</section>

<style>
  section {
    --section-padding: 2rem;
    min-height: 100dvh;
    padding: var(--section-padding);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 800px;
    gap: 1rem;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  h1 {
    font-size: 3rem;
    color: var(--color-heading);
    margin: 0;
    flex: 1;
    text-align: center;
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

  .header-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-family: var(--font-body);
    background: var(--color-heading);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .action-btn:hover {
    background: var(--color-accent);
    transform: scale(1.05);
  }

  .card-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 400px;
    flex: 1;
    min-height: 0;
    padding: 0.5rem;
    position: relative;
  }

  .controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    padding: 0.5rem;
    flex-shrink: 0;
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
    min-width: 100px;
    font-variant-numeric: tabular-nums;
  }

  .hint {
    font-size: 0.9rem;
    color: var(--color-heading);
    opacity: 0.7;
    margin: 0;
    flex-shrink: 0;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-state p {
    font-size: 1.5rem;
    color: var(--color-heading);
    font-family: var(--font-heading);
  }

  @media (max-width: 720px) {
    section {
      --section-padding: 0.75rem;
      gap: 0.5rem;
    }

    .header {
      flex-direction: column;
      align-items: stretch;
      flex-shrink: 0;
    }

    h1 {
      font-size: 1.75rem;
      text-align: left;
    }

    .back-btn {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }

    .header-actions {
      flex-direction: column;
    }

    .action-btn {
      width: 100%;
      padding: 0.4rem 0.75rem;
      font-size: 0.9rem;
    }

    .controls {
      justify-content: space-between;
      gap: 0.5rem;
      width: 100%;
      padding: 0.25rem;
    }

    .progress {
      flex-grow: 1;
      font-size: 1.2rem;
    }

    .nav-btn {
      width: 100%;
      max-width: 250px;
      padding: 0.5rem;
      font-size: 1.1rem;
    }
  }
</style>
