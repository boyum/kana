<script lang="ts">
  import { goto } from "$app/navigation";
  import { handleLinkClick } from "$lib/utils/interaction";
  import ConfigModal from "$lib/components/ConfigModal.svelte";
  import * as m from "$lib/paraglide/messages";

  let isConfigOpen = $state(false);
</script>

<svelte:head>
  <title>{m.app_title()}</title>
  <meta name="description" content={m.app_description()} />
</svelte:head>

<div class="top-actions">
  <a
    href="/progresjon"
    rel="prefetch"
    class="progress-button"
    title={m.progress_title()}
    aria-label={m.progress_title()}
  >
    📊
  </a>
  <button
    class="config-button"
    onclick={() => (isConfigOpen = true)}
    aria-label={m.settings_button_label()}
    title={m.settings_title()}
  >
    ⚙️
  </button>
</div>

<ConfigModal bind:isOpen={isConfigOpen} />

<section>
  <h1>{m.homepage_heading()}</h1>
  <div class="mode-buttons">
    <div class="kana-buttons">
      <a
        href="/hiragana"
        rel="prefetch"
        class="mode-btn"
        onpointerdown={e => handleLinkClick(e, "/hiragana", goto)}
      >
        {m.hiragana()}&nbsp;あ
      </a>
      <a
        href="/katakana"
        rel="prefetch"
        class="mode-btn"
        onpointerdown={e => handleLinkClick(e, "/katakana", goto)}
      >
        {m.katakana()}&nbsp;ツ
      </a>
    </div>
    <a
      href="/egendefinert"
      rel="prefetch"
      class="mode-btn custom"
      onpointerdown={e => handleLinkClick(e, "/egendefinert", goto)}
    >
      ✨ {m.custom_flashcards()}
    </a>
  </div>
</section>

<style>
  .top-actions {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    display: flex;
    gap: 1rem;
    z-index: 100;
  }

  .progress-button,
  .config-button {
    width: 60px;
    height: 60px;
    font-size: 2rem;
    background: var(--color-accent);
    color: white;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(57, 92, 107, 0.3);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  .progress-button:hover {
    background: var(--color-heading);
    transform: translateY(-3px) scale(1.1);
    box-shadow: 0 12px 30px rgba(57, 92, 107, 0.4);
  }

  .config-button:hover {
    background: var(--color-heading);
    transform: translateY(-3px) scale(1.1) rotate(90deg);
    box-shadow: 0 12px 30px rgba(57, 92, 107, 0.4);
  }

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
    .top-actions {
      top: 1rem;
      right: 1rem;
      gap: 0.5rem;
    }

    .progress-button,
    .config-button {
      width: 50px;
      height: 50px;
      font-size: 1.5rem;
    }

    h1 {
      font-size: 3rem;
    }

    .mode-btn {
      padding: 1.5rem 2rem;
      font-size: 1.5rem;
    }
  }
</style>
