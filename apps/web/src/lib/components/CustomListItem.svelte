<script lang="ts">
  import type { CustomList } from "$lib/types/customLists";

  export let list: CustomList;

  export let onPractice: (listId: string) => void;
  export let onEdit: (listId: string) => void;
  export let onShare: (listId: string) => void;
  export let onDuplicate: (listId: string) => void;
  export let onExport: (listId: string) => void;
  export let onDelete: (listId: string) => void;

  export let multiSelectMode: boolean = false;
  export let isSelected: boolean = false;

  let showDialog = false;

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

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("nb-NO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  function handleDialogAction(callback: (listId: string) => void) {
    callback(list.id);
    showDialog = false;
  }

  let dialogElement: HTMLDialogElement;

  $: if (showDialog && dialogElement) {
    dialogElement.showModal();
  } else if (!showDialog && dialogElement) {
    dialogElement.close();
  }
</script>

<div class="list-card" class:selected={isSelected && multiSelectMode}>
  {#if multiSelectMode}
    <div class="checkbox-container">
      <input
        type="checkbox"
        checked={isSelected}
        onchange={() => onPractice(list.id)}
        class="list-checkbox"
        aria-label={`Velg ${list.name}`}
      />
    </div>
  {:else}
    <button
      class="menu-btn"
      onpointerdown={createInteractionHandler(() => {
        showDialog = true;
      })}
      onkeydown={createInteractionHandler(() => {
        showDialog = true;
      })}
      aria-label="Flere handlinger"
    >
      ⋯
    </button>
  {/if}
  <div class="list-header">
    <h2 class="list-name">{list.name}</h2>
  </div>
  <div class="list-info">
    <p class="card-count">{list.cards.length} kort</p>
    <p class="last-updated">Oppdatert: {formatDate(list.updatedAt)}</p>
  </div>
  {#if !multiSelectMode}
    <div class="list-actions">
      <button
        class="action-btn practice"
        onpointerdown={createInteractionHandler(() => onPractice(list.id))}
        onkeydown={createInteractionHandler(() => onPractice(list.id))}
      >
        🎯 Øv
      </button>
      <button
        class="action-btn share"
        onpointerdown={createInteractionHandler(() => onShare(list.id))}
        onkeydown={createInteractionHandler(() => onShare(list.id))}
      >
        🔗 Del
      </button>
    </div>
  {/if}
</div>

<!-- Actions Dialog -->
{#if showDialog}
  <dialog
    bind:this={dialogElement}
    class="dialog"
    onpointerdown={e => e.stopPropagation()}
    onkeydown={e => {
      if (e.key === "Escape") {
        e.preventDefault();
        showDialog = false;
      }
      e.stopPropagation();
    }}
  >
    <h2>Handlinger</h2>
    <div class="dialog-actions">
      <button
        class="dialog-btn edit"
        onpointerdown={createInteractionHandler(() =>
          handleDialogAction(onEdit),
        )}
        onkeydown={createInteractionHandler(() =>
          handleDialogAction(onEdit),
        )}
      >
        ✏️ Rediger
      </button>
      <button
        class="dialog-btn duplicate"
        onpointerdown={createInteractionHandler(() =>
          handleDialogAction(onDuplicate),
        )}
        onkeydown={createInteractionHandler(() =>
          handleDialogAction(onDuplicate),
        )}
      >
        📋 Dupliser
      </button>
      <button
        class="dialog-btn export"
        onpointerdown={createInteractionHandler(() =>
          handleDialogAction(onExport),
        )}
        onkeydown={createInteractionHandler(() =>
          handleDialogAction(onExport),
        )}
      >
        💾 Eksporter
      </button>
      <button
        class="dialog-btn delete"
        onpointerdown={createInteractionHandler(() =>
          handleDialogAction(onDelete),
        )}
        onkeydown={createInteractionHandler(() =>
          handleDialogAction(onDelete),
        )}
      >
        🗑️ Slett
      </button>
      <button
        class="dialog-btn cancel"
        onpointerdown={createInteractionHandler(() => {
          showDialog = false;
        })}
        onkeydown={createInteractionHandler(() => {
          showDialog = false;
        })}
      >
        Lukk
      </button>
    </div>
  </dialog>
{/if}

<style>
  .list-card {
    background: white;
    border-radius: 30px;
    padding: 1.5rem;
    box-shadow: 0 8px 20px rgba(57, 92, 107, 0.15);
    transition: all 0.3s ease;
    border: 3px solid transparent;
    position: relative;
  }

  .list-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(57, 92, 107, 0.25);
    border-color: var(--color-accent);
  }

  .list-card.selected {
    border-color: var(--color-accent);
    background: linear-gradient(135deg, #e8f4fd 0%, #f0f9ff 100%);
  }

  .checkbox-container {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .list-checkbox {
    width: 24px;
    height: 24px;
    cursor: pointer;
    accent-color: var(--color-accent);
  }

  .menu-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    color: var(--color-heading);
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  .menu-btn:hover {
    opacity: 1;
    transform: scale(1.2);
  }

  .list-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .list-name {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    color: var(--color-heading);
    margin: 0;
    flex: 1;
  }

  .list-info {
    margin-bottom: 1rem;
    color: var(--color-text);
  }

  .card-count {
    font-size: 1.1rem;
    font-weight: bold;
    margin: 0.25rem 0;
  }

  .last-updated {
    font-size: 0.9rem;
    margin: 0.25rem 0;
    opacity: 0.7;
  }

  .list-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-family: var(--font-heading);
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
  }

  .action-btn.practice {
    background: var(--color-accent);
    color: white;
  }

  .action-btn.practice:hover {
    background: #6b8fd6;
    transform: scale(1.05);
  }

  .action-btn.share {
    background: #4caf50;
    color: white;
  }

  .action-btn.share:hover {
    background: #45a049;
    transform: scale(1.05);
  }

  /* Dialog Styles */
  .dialog {
    background: white;
    border-radius: 25px;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(57, 92, 107, 0.3);
    max-width: 400px;
    width: 90vw;
    border: none;
  }

  .dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  .dialog h2 {
    font-family: var(--font-heading);
    color: var(--color-heading);
    margin: 0 0 1.5rem 0;
    text-align: center;
  }

  .dialog-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .dialog-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-family: var(--font-heading);
    border: none;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .dialog-btn.edit {
    background: var(--color-heading);
    color: white;
  }

  .dialog-btn.edit:hover {
    background: #2a4654;
    transform: translateX(5px);
  }

  .dialog-btn.duplicate {
    background: #e6e1c5;
    color: var(--color-heading);
  }

  .dialog-btn.duplicate:hover {
    background: #d4cfb8;
    transform: translateX(5px);
  }

  .dialog-btn.export {
    background: #e6e1c5;
    color: var(--color-heading);
  }

  .dialog-btn.export:hover {
    background: #d4cfb8;
    transform: translateX(5px);
  }

  .dialog-btn.delete {
    background: #ff6b6b;
    color: white;
  }

  .dialog-btn.delete:hover {
    background: #ff5252;
    transform: translateX(5px);
  }

  .dialog-btn.cancel {
    background: #ddd;
    color: #333;
  }

  .dialog-btn.cancel:hover {
    background: #ccc;
    transform: translateX(5px);
  }

  @media (max-width: 768px) {
    .list-card {
      padding: 3rem 1rem 1rem 1rem;
    }

    .menu-btn {
      top: 0.75rem;
      right: 0.75rem;
    }

    .action-btn {
      padding: 0.6rem 1rem;
      font-size: 0.95rem;
    }

    .dialog {
      padding: 1.5rem;
      max-width: 90vw;
    }

    .dialog-btn {
      padding: 0.6rem 1rem;
      font-size: 0.95rem;
    }
  }
</style>
