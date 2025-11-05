<script lang="ts">
  import { goto } from "$app/navigation";
  import { handleLinkClick } from "$lib/utils/interaction";
  import { onMount } from "svelte";
</script>

<svelte:head>
  <title>Kana</title>
  <meta name="description" content="Lær Hiragana og Katakana med flash cards" />
</svelte:head>

<section>
  <h1>Velg modus</h1>
  <div class="mode-buttons">
    <div class="kana-buttons">
      <a
        href="/hiragana"
        rel="prefetch"
        class="mode-btn"
        on:pointerdown={e => handleLinkClick(e, "/hiragana", goto)}
      >
        Hiragana&nbsp;あ
      </a>
      <a
        href="/katakana"
        rel="prefetch"
        class="mode-btn"
        on:pointerdown={e => handleLinkClick(e, "/katakana", goto)}
      >
        Katakana&nbsp;ツ
      </a>
    </div>
    <a
      href="/custom"
      rel="prefetch"
      class="mode-btn custom"
      on:pointerdown={e => handleLinkClick(e, "/custom", goto)}
    >
      ✨ Dine egne flash-kort
    </a>
  </div>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 2rem;
  }

  h1 {
    font-size: 4rem;
    margin-bottom: 3rem;
    color: var(--color-heading);
  }

  .mode-buttons {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  .kana-buttons {
    display: flex;

    & :first-child {
      border-start-end-radius: 0;
      border-end-end-radius: 0;
      border-inline-end-width: 0;
    }

    & :last-child {
      border-end-start-radius: 0;
      border-start-start-radius: 0;
    }
  }

  .mode-btn {
    padding: 2rem 3rem;
    font-size: 2rem;
    font-family: var(--font-heading);
    background: var(--color-accent);
    color: white;
    border-radius: 50px;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 8px 20px rgba(57, 92, 107, 0.2);
    border: 4px solid rgba(255, 255, 255, 0.3);
  }

  .mode-btn:hover {
    background: var(--color-heading);
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 12px 30px rgba(57, 92, 107, 0.3);
  }

  @media (max-width: 720px) {
    h1 {
      font-size: 3rem;
    }

    .mode-btn {
      padding: 1.5rem 2rem;
      font-size: 1.5rem;
    }
  }
</style>
