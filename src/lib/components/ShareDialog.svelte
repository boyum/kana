<script lang="ts">
  import { onMount } from "svelte";
  import type { CustomList } from "$lib/types/customLists";
  import { generateShareToken, generateShareUrl } from "$lib/utils/sharing";

  export let list: CustomList;
  export let onClose: () => void;

  let shareToken = "";
  let shareUrl = "";
  let isGenerating = true;
  let copySuccess = false;
  let copyUrlSuccess = false;

  onMount(async () => {
    await generateTokens();
  });

  async function generateTokens() {
    isGenerating = true;
    try {
      shareToken = await generateShareToken(list);
      shareUrl = await generateShareUrl(list, window.location.origin);
    } catch (error) {
      console.error("Failed to generate share tokens:", error);
      alert("Kunne ikke generere delingskode");
    } finally {
      isGenerating = false;
    }
  }

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(shareToken);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 2000);
    } catch (error) {
      alert("Kunne ikke kopiere til utklippstavle");
    }
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copyUrlSuccess = true;
      setTimeout(() => {
        copyUrlSuccess = false;
      }, 2000);
    } catch (error) {
      alert("Kunne ikke kopiere til utklippstavle");
    }
  }

  // Unified interaction handler for mobile-first approach
  function createInteractionHandler(callback: () => void) {
    return (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          callback();
        }
      } else if (e instanceof PointerEvent && e.isPrimary) {
        e.preventDefault();
        callback();
      }
    };
  }
</script>

<div
  class="modal-overlay"
  on:pointerdown={(e) => {
    if (e.target === e.currentTarget && e.isPrimary) {
      e.preventDefault();
      onClose();
    }
  }}
  on:keydown={(e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
>
  <div 
    class="modal" 
    on:pointerdown={(e) => e.stopPropagation()}
    on:keydown={(e) => e.stopPropagation()}
    role="document"
  >
    <h2>🔗 Del liste</h2>
    <p class="list-name">"{list.name}"</p>

    {#if isGenerating}
      <p class="loading">Genererer delingskode...</p>
    {:else}
      <div class="share-section">
        <h3>Delingslenke</h3>
        <p class="instruction">Del denne lenken med andre:</p>
        <div class="code-box">
          <code>{shareUrl}</code>
        </div>
        <button 
          class="copy-btn" 
          on:pointerdown={createInteractionHandler(copyUrl)}
          on:keydown={createInteractionHandler(copyUrl)}
        >
          {copyUrlSuccess ? "✅ Kopiert!" : "📋 Kopier lenke"}
        </button>
      </div>

      <div class="share-section">
        <h3>Delingskode</h3>
        <p class="instruction">Eller del denne koden:</p>
        <div class="code-box">
          <code>{shareToken}</code>
        </div>
        <button 
          class="copy-btn" 
          on:pointerdown={createInteractionHandler(copyToken)}
          on:keydown={createInteractionHandler(copyToken)}
        >
          {copySuccess ? "✅ Kopiert!" : "📋 Kopier kode"}
        </button>
      </div>

      <div class="info-box">
        <p>
          💡 Tips: Mottakeren kan importere listen ved å klikke på lenken du
          delte
        </p>
      </div>
    {/if}

    <div class="modal-actions">
      <button 
        class="close-btn" 
        on:pointerdown={createInteractionHandler(onClose)}
        on:keydown={createInteractionHandler(onClose)}
      > 
        Lukk 
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
  }

  .modal {
    background: white;
    border-radius: 30px;
    padding: 2rem;
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  h2 {
    font-family: var(--font-heading);
    color: var(--color-heading);
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 2rem;
  }

  .list-name {
    font-size: 1.2rem;
    color: var(--color-text);
    font-style: italic;
    margin-bottom: 2rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: var(--color-heading);
    font-family: var(--font-heading);
  }

  .share-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--color-bg-primary);
    border-radius: 20px;
  }

  .share-section h3 {
    font-family: var(--font-heading);
    color: var(--color-heading);
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }

  .instruction {
    margin-bottom: 1rem;
    color: var(--color-text);
  }

  .code-box {
    background: white;
    border: 2px solid var(--color-accent);
    border-radius: 15px;
    padding: 1rem;
    margin-bottom: 1rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-height: 150px;
    overflow-y: auto;
  }

  .code-box code {
    font-family: var(--font-mono);
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--color-text);
  }

  .copy-btn {
    width: 100%;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-family: var(--font-heading);
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: var(--color-accent);
    color: white;
  }

  .copy-btn:hover {
    background: var(--color-heading);
    transform: scale(1.02);
  }

  .info-box {
    background: #e8f4f8;
    border-left: 4px solid var(--color-accent);
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 10px;
  }

  .info-box p {
    margin: 0 0 0.5rem 0;
    font-weight: bold;
    color: var(--color-heading);
  }

  .info-box ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .info-box li {
    margin: 0.25rem 0;
    color: var(--color-text);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 2px solid var(--color-bg-primary);
  }

  .close-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-family: var(--font-heading);
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: var(--color-heading);
    color: white;
  }

  .close-btn:hover {
    background: var(--color-accent);
  }

  @media (max-width: 768px) {
    .modal {
      padding: 1.5rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    .code-box {
      font-size: 0.8rem;
    }
  }
</style>
