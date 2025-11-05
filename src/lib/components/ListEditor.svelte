<script lang="ts">
  import type { CustomList, CustomFlashCard } from "$lib/types/customLists";
  import { generateId } from "$lib/utils/storage";
  import { onMount } from "svelte";

  export let list: CustomList | null = null; // null for new list
  export let onSave: (list: CustomList) => void;
  export let onCancel: () => void;

  // Initialize or use existing list
  let listName = list?.name || "";
  let listType: "hiragana" | "katakana" | "mixed" | "custom" =
    list?.type || "custom";
  let cards: CustomFlashCard[] = list?.cards.map((c) => ({ ...c })) || [];

  let showBulkImport = false;
  let bulkImportText = "";
  let bulkImportError = "";

  let showQuickAdd = false;
  let quickAddText = "";
  let quickAddError = "";

  function addCard() {
    cards = [
      ...cards,
      {
        id: generateId(),
        front: "",
        back: "",
        type: listType,
        createdAt: new Date(),
      },
    ];
  }

  function removeCard(index: number) {
    cards = cards.filter((_, i) => i !== index);
  }

  function handleSave() {
    // Validate
    if (!listName.trim()) {
      alert("Vennligst gi listen et navn");
      return;
    }

    const validCards = cards.filter(
      (card) => card.front.trim() !== "" && card.back.trim() !== "",
    );

    if (validCards.length === 0) {
      alert("Vennligst legg til minst ett kort");
      return;
    }

    const updatedList: CustomList = {
      id: list?.id || generateId(),
      name: listName.trim(),
      type: listType,
      cards: validCards,
      createdAt: list?.createdAt || new Date(),
      updatedAt: new Date(),
      defaultDirection: "front-to-back",
    };

    onSave(updatedList);
  }

  function openBulkImport() {
    showBulkImport = true;
    bulkImportText = "";
    bulkImportError = "";
  }

  function closeBulkImport() {
    showBulkImport = false;
  }

  function handleBulkImport() {
    bulkImportError = "";

    if (!bulkImportText.trim()) {
      bulkImportError = "Vennligst lim inn data";
      return;
    }

    try {
      const lines = bulkImportText.trim().split("\n");
      const newCards: CustomFlashCard[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Support both tab and comma separation
        const parts = line.includes("\t") ? line.split("\t") : line.split(",");

        if (parts.length < 2) {
          bulkImportError = `Linje ${i + 1}: Trenger minst forside og bakside`;
          return;
        }

        const card: CustomFlashCard = {
          id: generateId(),
          front: parts[0].trim(),
          back: parts[1].trim(),
          type: listType,
          meaning: parts[2]?.trim(),
          notes: parts[3]?.trim(),
          createdAt: new Date(),
        };

        newCards.push(card);
      }

      cards = [...cards, ...newCards];
      closeBulkImport();
    } catch (error) {
      bulkImportError = "Kunne ikke parse data. Sjekk formatet.";
    }
  }

  function openQuickAdd() {
    showQuickAdd = true;
    quickAddText = "";
    quickAddError = "";
  }

  function closeQuickAdd() {
    showQuickAdd = false;
  }

  function handleQuickAdd() {
    quickAddError = "";

    if (!quickAddText.trim()) {
      quickAddError = "Vennligst skriv inn data i formatet: wordAFront|wordABack";
      return;
    }

    try {
      const lines = quickAddText.trim().split("\n");
      const newCards: CustomFlashCard[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split("|");

        if (parts.length !== 2) {
          quickAddError = `Linje ${i + 1}: Ugyldig format. Forventet wordAFront|wordABack`;
          return;
        }

        const card: CustomFlashCard = {
          id: generateId(),
          front: parts[0].trim(),
          back: parts[1].trim(),
          type: listType,
          createdAt: new Date(),
        };

        newCards.push(card);
      }

      cards = [...cards, ...newCards];
      closeQuickAdd();
    } catch (error) {
      quickAddError = "Det oppstod en feil under parsing av dataene.";
    }
  }

  // Fixed font sizing for editor textareas: keep size consistent while editing

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

  // Placeholder logic
  let randomPlaceholder = "";

  function getRandomPlaceholderName() {
    const placeholders = [
      "F.eks. 'Daglige fraser'",
      "F.eks. 'Reiseordbok'",
      "F.eks. 'Mat og drikke'",
      "F.eks. 'Huskeliste'",
      "F.eks. 'Prosjektideer'",
      "F.eks. 'Norske byer'",
      "F.eks. 'Historiske datoer'",
      "F.eks. 'Vanlige verb'",
      "F.eks. 'Familieord'",
      "F.eks. 'Dyr på norsk'"
    ];

    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }

  onMount(() => {
    randomPlaceholder = getRandomPlaceholderName();
  });
</script>

<div class="editor-container">
  <div class="editor-header">
    <h2>{list ? "Rediger liste" : "Opprett ny liste"}</h2>
  </div>

  <div class="editor-content">
    <!-- List settings -->
    <div class="settings-section">
      <div class="form-group">
        <label for="list-name">Listenavn *</label>
        <input
          id="list-name"
          type="text"
          bind:value={listName}
          placeholder={getRandomPlaceholderName()}
          class="text-input"
        />
      </div>
    </div>

    <!-- Cards section -->
    <div class="cards-section">
      <div class="cards-header">
        <h3>Kort ({cards.length})</h3>
        <!-- <div class="cards-actions">
          <button 
            class="bulk-btn" 
            on:pointerdown={createInteractionHandler(openBulkImport)}
            on:keydown={createInteractionHandler(openBulkImport)}
          >
            📋 Masseopplasting
          </button>
        </div> -->
      </div>

      <div class="cards-list">
        {#if cards.length === 0}
          <p class="empty-cards">
            Ingen kort ennå. Klikk "Legg til kort" for å starte.
          </p>
        {:else}
          {#each cards as card, index (card.id)}
            <div class="card-item">
              <div class="card-number">{index + 1}</div>
              <div class="card-fields">
                <div class="field-row-main">
                  <div class="field-group">
                    <label for="front-{index}">Forside</label>
                    <textarea
                      id="front-{index}"
                      bind:value={card.front}
                      placeholder="ねこ"
                      class="field-textarea"
                      rows="3"
                    ></textarea>
                  </div>
                  <div class="field-group">
                    <label for="back-{index}">Bakside</label>
                    <textarea
                      id="back-{index}"
                      bind:value={card.back}
                      placeholder="cat"
                      class="field-textarea"
                      rows="3"
                    ></textarea>
                    
                  </div>
                </div>
                <div class="field-row">
                  <input
                    type="text"
                    bind:value={card.meaning}
                    placeholder="Betydning (valgfritt)"
                    class="field-input"
                  />
                  <input
                    type="text"
                    bind:value={card.notes}
                    placeholder="Notater (valgfritt)"
                    class="field-input"
                  />
                </div>
              </div>
              <button 
                class="remove-btn" 
                on:pointerdown={createInteractionHandler(() => removeCard(index))}
                on:keydown={createInteractionHandler(() => removeCard(index))}
              >
                🗑️
              </button>
            </div>
          {/each}
        {/if}

        <!-- Add card button moved below cards -->
        <button 
          class="add-card-btn" 
          on:pointerdown={createInteractionHandler(addCard)}
          on:keydown={createInteractionHandler(addCard)}
        >
          ➕ Legg til kort
        </button>
      </div>
    </div>
  </div>

  <!-- Footer actions -->
  <div class="editor-footer">
    <button 
      class="cancel-btn" 
      on:pointerdown={createInteractionHandler(onCancel)}
      on:keydown={createInteractionHandler(onCancel)}
    > 
      Avbryt 
    </button>
    <button 
      class="save-btn" 
      on:pointerdown={createInteractionHandler(handleSave)}
      on:keydown={createInteractionHandler(handleSave)}
    > 
      💾 Lagre liste 
    </button>
  </div>
</div>

<!-- Bulk import modal -->
{#if showBulkImport}
  <div 
    class="modal-overlay" 
    on:pointerdown={(e) => {
      if (e.target === e.currentTarget && e.isPrimary) {
        e.preventDefault();
        closeBulkImport();
      }
    }}
    on:keydown={(e) => {
      if (e.key === 'Escape') {
        closeBulkImport();
      }
    }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <dialog 
      class="modal" 
      on:pointerdown={(e) => e.stopPropagation()}
      on:keydown={(e) => e.stopPropagation()}
      tabindex="-1"
    >
      <h2>📋 Masseopplasting</h2>
      <p class="modal-instruction">
        Lim inn data med ett kort per linje. Format:<br />
        <code
          >forside&lt;TAB&gt;bakside&lt;TAB&gt;betydning&lt;TAB&gt;notater</code
        >
      </p>
      <p class="modal-example">
        Eksempel:<br />
        <code>こんにちは&lt;TAB&gt;konnichiwa&lt;TAB&gt;hello</code>
      </p>

      <textarea
        bind:value={bulkImportText}
        placeholder="Lim inn data her..."
        class="bulk-textarea"
        rows="10"
      ></textarea>

      {#if bulkImportError}
        <p class="error-message">❌ {bulkImportError}</p>
      {/if}

      <div class="modal-actions">
        <button 
          class="cancel-btn" 
          on:pointerdown={createInteractionHandler(closeBulkImport)}
          on:keydown={createInteractionHandler(closeBulkImport)}
        > 
          Avbryt 
        </button>
        <button 
          class="confirm-btn" 
          on:pointerdown={createInteractionHandler(handleBulkImport)}
          on:keydown={createInteractionHandler(handleBulkImport)}
        >
          Importer
        </button>
      </div>
    </dialog>
  </div>
{/if}

<!-- Quick add modal -->
{#if showQuickAdd}
  <div class="modal-overlay" on:pointerdown={(e) => {
    if (e.target === e.currentTarget && e.isPrimary) {
      e.preventDefault();
      closeQuickAdd();
    }
  }} on:keydown={(e) => {
    if (e.key === 'Escape') {
      closeQuickAdd();
    }
  }} role="dialog" aria-modal="true" tabindex="-1">
    <dialog class="modal" on:pointerdown={(e) => e.stopPropagation()} on:keydown={(e) => e.stopPropagation()} tabindex="-1">
      <h2>Rask Legg til</h2>
      <p class="modal-instruction">
        Skriv inn data i formatet:<br />
        <code>wordAFront|wordABack</code>
      </p>

      <textarea bind:value={quickAddText} placeholder="wordAFront|wordABack\nwordBFront|wordBBack" class="bulk-textarea" rows="10"></textarea>

      {#if quickAddError}
        <p class="error-message">❌ {quickAddError}</p>
      {/if}

      <div class="modal-actions">
        <button class="cancel-btn" on:pointerdown={createInteractionHandler(closeQuickAdd)} on:keydown={createInteractionHandler(closeQuickAdd)}>Avbryt</button>
        <button class="confirm-btn" on:pointerdown={createInteractionHandler(handleQuickAdd)} on:keydown={createInteractionHandler(handleQuickAdd)}>Legg til</button>
      </div>
    </dialog>
  </div>
{/if}

<style>
  .editor-container {
    background: white;
    border-radius: 30px;
    padding: 2rem;
    box-shadow: 0 8px 30px rgba(57, 92, 107, 0.2);
    max-width: 1000px;
    margin: 0 auto;
    width: 90%;
  }

  .editor-header h2 {
    font-family: var(--font-heading);
    color: var(--color-heading);
    margin: 0 0 2rem 0;
    text-align: center;
  }

  .editor-content {
    margin-bottom: 2rem;
  }

  .settings-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid var(--color-bg-primary);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-weight: bold;
    color: var(--color-heading);
    font-size: 1rem;
  }

  .text-input {
    padding: 0.75rem;
    font-size: 1rem;
    border: 2px solid var(--color-accent);
    border-radius: 15px;
    outline: none;
    transition: all 0.3s ease;
    font-family: var(--font-body);
  }

  .text-input:focus {
    border-color: var(--color-heading);
    box-shadow: 0 0 0 3px rgba(57, 92, 107, 0.1);
  }

  .cards-section {
    margin-bottom: 1rem;
  }

  .cards-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .cards-header h3 {
    font-family: var(--font-heading);
    color: var(--color-heading);
    margin: 0;
    font-size: 1.8rem;
  }

  .add-card-btn {
    width: 100%;
    padding: 1rem;
    margin-top: 1rem;
    font-size: 1.1rem;
    font-family: var(--font-heading);
    border: 2px dashed var(--color-accent);
    background: transparent;
    color: var(--color-accent);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .add-card-btn:hover {
    background: var(--color-accent);
    color: white;
    border-style: solid;
    transform: scale(1.02);
  }

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 500px;
    padding-right: 0.5rem;
  }

  .cards-list::-webkit-scrollbar {
    width: 8px;
  }

  .cards-list::-webkit-scrollbar-track {
    background: var(--color-bg-primary);
    border-radius: 10px;
  }

  .cards-list::-webkit-scrollbar-thumb {
    background: var(--color-accent);
    border-radius: 10px;
  }

  .empty-cards {
    text-align: center;
    padding: 3rem;
    color: var(--color-text);
    font-style: italic;
  }

  .card-item {
    display: flex;
    gap: 1rem;
    align-items: start;
    padding: 1rem;
    background: var(--color-bg-primary);
    border-radius: 20px;
    transition: all 0.3s ease;
  }

  .card-item:hover {
    box-shadow: 0 4px 15px rgba(57, 92, 107, 0.1);
  }

  .card-number {
    font-weight: bold;
    color: var(--color-heading);
    font-family: var(--font-heading);
    font-size: 1.2rem;
    min-width: 30px;
    text-align: center;
    padding-top: 0.75rem;
  }

  .card-fields {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .field-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-heading);
    margin-left: 0.5rem;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .field-textarea {
    padding: 0.75rem;
    border: 2px solid white;
    border-radius: 12px;
    outline: none;
    transition: all 0.3s ease;
    font-family: var(--font-body);
    font-size: 1.5rem;
    resize: vertical;
    min-height: 80px;
    text-align: center;
    font-weight: 500;
    line-height: 1.2;
  }

  .field-textarea:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(128, 164, 237, 0.1);
  }

  .field-input {
    padding: 0.75rem;
    font-size: 1rem;
    border: 2px solid white;
    border-radius: 12px;
    outline: none;
    transition: all 0.3s ease;
    font-family: var(--font-body);
  }

  .field-input:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(128, 164, 237, 0.1);
  }

  .remove-btn {
    padding: 0.5rem;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.2rem;
    min-width: 45px;
  }

  .remove-btn:hover {
    background: #ff5252;
    transform: scale(1.1);
  }

  .editor-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 2px solid var(--color-bg-primary);
  }

  .cancel-btn,
  .save-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
    font-family: var(--font-heading);
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cancel-btn {
    background: #ddd;
    color: #333;
  }

  .cancel-btn:hover {
    background: #ccc;
  }

  .save-btn {
    background: var(--color-accent);
    color: white;
  }

  .save-btn:hover {
    background: var(--color-heading);
    transform: scale(1.05);
  }

  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
  }

  .modal-instruction {
    margin-bottom: 0.5rem;
    color: var(--color-text);
  }

  .modal-example {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: var(--color-bg-primary);
    border-radius: 10px;
    font-size: 0.9rem;
  }

  .modal-instruction code,
  .modal-example code {
    background: white;
    padding: 0.25rem 0.5rem;
    border-radius: 5px;
    font-family: var(--font-mono);
    font-size: 0.9em;
  }

  .bulk-textarea {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    font-family: var(--font-mono);
    border: 2px solid var(--color-accent);
    border-radius: 15px;
    resize: vertical;
    outline: none;
    margin-bottom: 1rem;
  }

  .bulk-textarea:focus {
    border-color: var(--color-heading);
  }

  .error-message {
    color: #ff5252;
    font-weight: bold;
    margin: 0.5rem 0;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .confirm-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-family: var(--font-heading);
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: var(--color-accent);
    color: white;
  }

  .confirm-btn:hover {
    background: var(--color-heading);
  }

  @media (max-width: 768px) {
    .editor-container {
      padding: 1rem;
    }

    .settings-section {
      grid-template-columns: 1fr;
    }

    .cards-header {
      flex-direction: column;
      align-items: stretch;
    }

    .editor-footer {
      flex-direction: column-reverse;
    }

    .cancel-btn,
    .save-btn {
      width: 100%;
    }
  }
</style>
