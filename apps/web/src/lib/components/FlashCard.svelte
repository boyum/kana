<script lang="ts">
  import { fade } from "svelte/transition";

  // Support both old and new props
  export let character: string = "";
  export let romanization: string = "";
  export let front: string = "";
  export let back: string = "";
  export let meaning: string = "";
  export let notes: string = "";
  export let isFlipped: boolean = false;
  export let cardId: string = ""; // For tracking which card this is
  export let onPerformanceRecorded:
    | ((data: CardPerformanceData) => void)
    | undefined = undefined;

  // Performance tracking
  interface CardPerformanceData {
    cardId: string;
    responseTimeMs: number;
    flipCount: number;
    wasCorrect: boolean;
  }

  let cardShowTime: number = 0;
  let flipCountThisSession: number = 0;
  let performanceRecorded: boolean = false;

  // Use front/back if provided, otherwise fall back to character/romanization
  $: frontContent = front || character;
  $: backContent = back || romanization;
  $: hasMetadata = meaning || notes;

  // Record when card is shown
  function onCardShown() {
    cardShowTime = Date.now();
    flipCountThisSession = 0;
    performanceRecorded = false;
  }

  // Track each flip and record performance on first flip
  function handleInteraction(e: PointerEvent | KeyboardEvent) {
    let shouldFlip = false;

    if (e instanceof KeyboardEvent) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        shouldFlip = true;
      }
    } else if (e instanceof PointerEvent && e.isPrimary) {
      e.preventDefault();
      shouldFlip = true;
    }

    if (shouldFlip) {
      flipCountThisSession += 1;

      // Record performance on first flip (first interaction with this card)
      if (!performanceRecorded && cardShowTime > 0 && onPerformanceRecorded) {
        const responseTimeMs = Date.now() - cardShowTime;
        const wasCorrect = responseTimeMs < 5000 && flipCountThisSession === 1;

        onPerformanceRecorded({
          cardId,
          responseTimeMs,
          flipCount: flipCountThisSession,
          wasCorrect,
        });

        performanceRecorded = true;
      }

      isFlipped = !isFlipped;
    }
  }

  // Lifecycle: record time when component mounts
  import { onMount } from "svelte";

  onMount(() => {
    onCardShown();
  });

  // Dynamic font size based on content length
  function getFontSize(text: string): string {
    if (!text) return "10rem";
    const lengthOfLongestWord = Math.max(
      ...text.split(/[\s-.]/).map(word => word.length),
    );

    const len = lengthOfLongestWord;

    if (len > 40) return "1.5rem";
    if (len > 20) return "2rem";
    if (len > 10) return "3rem";
    if (len > 7) return "3.25rem";
    if (len > 5) return "3.5rem";
    if (len > 4) return "3.66rem";
    if (len > 3) return "4rem";
    if (len > 2) return "4.5rem";
    if (len > 1) return "6rem";

    return "10rem";
  }
</script>

<button
  class="flash-card"
  class:flipped={isFlipped}
  onpointerdown={handleInteraction}
  onkeydown={handleInteraction}
  in:fade={{ duration: 200, delay: 200 }}
  out:fade={{ duration: 200 }}
>
  <div class="card-inner">
    <div class="card-front">
      <span class="content" style="font-size: {getFontSize(frontContent)}"
        >{frontContent}</span
      >
    </div>
    <div class="card-back">
      <div class="back-content">
        <span
          class="main-content"
          style="--font-size: {getFontSize(backContent)}">{backContent}</span
        >
        {#if hasMetadata}
          <div class="metadata">
            {#if meaning}
              <p class="meaning">📖 {meaning}</p>
            {/if}
            {#if notes}
              <p class="notes">💡 {notes}</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</button>

<style>
  .flash-card {
    width: 100%;
    max-width: 400px;
    height: 500px;
    max-height: 60vh;
    perspective: 1000px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-wrap: pretty;
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
  }

  .flash-card.flipped .card-inner {
    transform: rotateY(180deg);
  }

  .card-front,
  .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 40px;
    box-shadow: 0 10px 40px rgba(57, 92, 107, 0.25);
    border: 6px solid rgba(255, 255, 255, 0.4);
    padding: 2rem;
    box-sizing: border-box;
  }

  .card-front {
    background: linear-gradient(135deg, #80a4ed 0%, #6b8fd6 100%);
    color: white;
  }

  .card-back {
    background: linear-gradient(135deg, #395c6b 0%, #2a4654 100%);
    color: white;
    transform: rotateY(180deg);
  }

  .content,
  .main-content {
    font-weight: bold;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    word-wrap: break-word;
    text-align: center;
    max-width: 100%;
    font-size: var(--font-size);
  }

  .back-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .main-content {
    font-family: var(--font-heading);
    flex-shrink: 0;
  }

  .metadata {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 1rem;
    text-align: center;
    max-width: 100%;
    flex-shrink: 1;
    overflow-y: auto;
  }

  .meaning,
  .notes {
    margin: 0;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .flash-card:hover .card-inner {
    transform: scale(1.02);
  }

  .flash-card.flipped:hover .card-inner {
    transform: rotateY(180deg) scale(1.02);
  }

  @media (max-width: 720px) {
    .flash-card {
      max-width: 320px;
      height: 400px;
      max-height: 50vh;
    }

    .card-front,
    .card-back {
      padding: 1rem;
    }

    .metadata {
      font-size: 0.85rem;
    }

    .main-content {
      font-size: calc(var(--font-size) * 0.8);
    }
  }
</style>
