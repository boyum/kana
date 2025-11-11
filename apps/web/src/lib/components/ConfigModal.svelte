<script lang="ts">
  import {
    configStore,
    type ShuffleMode,
    type Direction,
    type Language,
    type DisplayMode,
  } from "$lib/stores/config.svelte";
  import {
    downloadExportData,
    importData,
    resetAllData,
    getStorageInfo,
    formatBytes,
  } from "$lib/utils/configStorage";
  import * as m from "$lib/paraglide/messages";

  interface Props {
    isOpen?: boolean;
    onClose?: () => void;
  }

  let { isOpen = $bindable(false), onClose }: Props = $props();

  // Local state for form (only synced on save)
  let enableSmartShuffle = $state(configStore.enableSmartShuffle);
  let defaultShuffleMode = $state(configStore.defaultShuffleMode);
  let defaultDirection = $state(configStore.defaultDirection);
  let displayMode = $state(configStore.displayMode);
  let language = $state(configStore.language);

  let showResetConfirm = $state(false);
  let importError = $state<string | null>(null);
  let importSuccess = $state(false);

  const shuffleModes = $derived<
    Array<{ value: ShuffleMode; label: string; icon: string }>
  >([
    { value: "balanced", label: m.shuffle_mode_balanced(), icon: "⚖️" },
    {
      value: "mastery-focused",
      label: m.shuffle_mode_mastery_focused(),
      icon: "🎯",
    },
    {
      value: "challenge-first",
      label: m.shuffle_mode_challenge_first(),
      icon: "🔥",
    },
  ]);

  const directions = $derived<Array<{ value: Direction; label: string }>>([
    { value: "front-to-back", label: m.direction_front_to_back() },
    { value: "back-to-front", label: m.direction_back_to_front() },
  ]);

  const displayModes: Array<{
    value: DisplayMode;
    label: string;
    description: string;
  }> = [
    {
      value: "flip",
      label: "Flip Cards",
      description: "Classic flip animation - test yourself",
    },
    {
      value: "dual-side",
      label: "Dual-Side View",
      description: "See both sides at once - for initial practice",
    },
  ];

  const languages: Array<{ value: Language; label: string }> = [
    { value: "nb", label: "Norsk (Bokmål)" },
    { value: "en", label: "English" },
  ];

  // Load current config when modal opens
  $effect(() => {
    if (isOpen) {
      enableSmartShuffle = configStore.enableSmartShuffle;
      defaultShuffleMode = configStore.defaultShuffleMode;
      defaultDirection = configStore.defaultDirection;
      displayMode = configStore.displayMode;
      language = configStore.language;
      importError = null;
      importSuccess = false;
    }
  });

  function handleSave() {
    configStore.updateConfig({
      enableSmartShuffle,
      defaultShuffleMode,
      defaultDirection,
      displayMode,
      language,
    });
    handleClose();
  }

  function handleClose() {
    isOpen = false;
    onClose?.();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      handleClose();
    }
  }

  function handleExport() {
    downloadExportData();
  }

  async function handleImport(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      await importData(file);
      importSuccess = true;
      importError = null;
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      importError = error instanceof Error ? error.message : m.import_error();
      importSuccess = false;
    }

    // Reset input
    input.value = "";
  }

  function handleResetConfirm() {
    resetAllData();
    configStore.resetConfig();
    showResetConfirm = false;
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  // Only compute storage info on client side
  const storageInfo = $derived.by(() => {
    if (typeof window === "undefined") {
      return { used: 0, total: 5 * 1024 * 1024, percentage: 0 };
    }
    return getStorageInfo();
  });
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="modal-backdrop"
    onclick={handleBackdropClick}
    onkeydown={handleKeyDown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="config-title"
    tabindex="-1"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="config-title">⚙️ {m.settings_title()}</h2>
        <button
          class="close-btn"
          onclick={handleClose}
          aria-label={m.close_settings()}
        >
          ✕
        </button>
      </div>

      <div class="modal-body">
        <section class="config-section">
          <h3>🎴 {m.smart_shuffle_section_title()}</h3>

          <label class="toggle-label">
            <input type="checkbox" bind:checked={enableSmartShuffle} />
            <span>{m.enable_smart_shuffle()}</span>
          </label>

          {#if enableSmartShuffle}
            <div class="setting-group">
              <p class="setting-label">{m.default_mode()}:</p>
              <div class="mode-buttons">
                {#each shuffleModes as mode}
                  <button
                    class="mode-btn"
                    class:active={defaultShuffleMode === mode.value}
                    onclick={() => (defaultShuffleMode = mode.value)}
                  >
                    <span class="icon">{mode.icon}</span>
                    <span>{mode.label}</span>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </section>

        <!-- Direction -->
        <section class="config-section">
          <h3>🔄 {m.direction_section_title()}</h3>
          <div class="setting-group">
            <label class="setting-label" for="direction"
              >{m.default_direction()}:</label
            >
            <select id="direction" bind:value={defaultDirection}>
              {#each directions as dir}
                <option value={dir.value}>{dir.label}</option>
              {/each}
            </select>
          </div>
        </section>

        <!-- Display Mode -->
        <section class="config-section">
          <h3>👁️ Display Mode</h3>
          <div class="setting-group">
            <div class="mode-buttons display-mode-buttons">
              {#each displayModes as mode}
                <button
                  class="display-mode-btn"
                  class:active={displayMode === mode.value}
                  onclick={() => (displayMode = mode.value)}
                >
                  <span class="mode-label">{mode.label}</span>
                  <span class="mode-description">{mode.description}</span>
                </button>
              {/each}
            </div>
          </div>
        </section>

        <!-- Language -->
        <section class="config-section">
          <h3>🌐 {m.language_section_title()}</h3>
          <div class="setting-group">
            <select id="language" bind:value={language}>
              {#each languages as lang}
                <option value={lang.value}>{lang.label}</option>
              {/each}
            </select>
          </div>
        </section>

        <!-- Data Management -->
        <section class="config-section">
          <h3>📊 {m.data_section_title()}</h3>

          <div class="data-buttons">
            <button class="data-btn" onclick={handleExport}>
              📥 {m.export_data()}
            </button>

            <label class="data-btn import-btn">
              📤 {m.import_data()}
              <input
                type="file"
                accept=".json"
                onchange={handleImport}
                style="display: none;"
              />
            </label>

            {#if !showResetConfirm}
              <button
                class="data-btn danger"
                onclick={() => (showResetConfirm = true)}
              >
                🗑️ {m.reset_all_data()}
              </button>
            {:else}
              <div class="reset-confirm">
                <p>{m.reset_confirm_message()}</p>
                <div class="reset-actions">
                  <button class="data-btn danger" onclick={handleResetConfirm}>
                    {m.yes_reset()}
                  </button>
                  <button
                    class="data-btn"
                    onclick={() => (showResetConfirm = false)}
                  >
                    {m.cancel()}
                  </button>
                </div>
              </div>
            {/if}
          </div>

          {#if importError}
            <p class="error-message">❌ {importError}</p>
          {/if}

          {#if importSuccess}
            <p class="success-message">✅ {m.data_imported_success()}</p>
          {/if}

          <div class="storage-info">
            <p>
              {m.storage_used({
                used: formatBytes(storageInfo.used),
                total: formatBytes(storageInfo.total),
              })}
            </p>
            <div class="storage-bar">
              <div
                class="storage-fill"
                style="width: {Math.min(storageInfo.percentage, 100)}%"
              ></div>
            </div>
          </div>
        </section>

        <!-- About -->
        <section class="config-section">
          <h3>ℹ️ {m.about_section_title()}</h3>
          <p class="version">{m.version({ version: "1.0.0" })}</p>
        </section>
      </div>

      <div class="modal-footer">
        <button class="footer-btn cancel" onclick={handleClose}>
          {m.cancel()}
        </button>
        <button class="footer-btn save" onclick={handleSave}>
          💾 {m.save()}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    background: var(--color-bg-primary);
    border-radius: 20px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
    border: 3px solid rgba(57, 92, 107, 0.2);
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 2px solid rgba(57, 92, 107, 0.2);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 2rem;
    color: var(--color-heading);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: var(--color-heading);
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(57, 92, 107, 0.1);
    transform: scale(1.1);
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .config-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 15px;
    border: 2px solid rgba(57, 92, 107, 0.1);
  }

  .config-section:last-child {
    margin-bottom: 0;
  }

  .config-section h3 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    color: var(--color-heading);
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.1rem;
    font-family: var(--font-heading);
    cursor: pointer;
    user-select: none;
    margin-bottom: 1rem;
  }

  .toggle-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: var(--color-accent);
  }

  .setting-group {
    margin-top: 1rem;
  }

  .setting-label {
    display: block;
    font-family: var(--font-heading);
    color: var(--color-heading);
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  select {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    font-family: var(--font-body);
    background: white;
    border: 2px solid rgba(57, 92, 107, 0.2);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  select:hover,
  select:focus {
    border-color: var(--color-accent);
    outline: none;
  }

  .mode-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .mode-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem;
    background: white;
    border: 2px solid rgba(57, 92, 107, 0.2);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-heading);
    font-size: 0.85rem;
  }

  .mode-btn:hover {
    border-color: var(--color-accent);
    background: rgba(128, 164, 237, 0.1);
  }

  .mode-btn.active {
    background: var(--color-accent);
    color: white;
    border-color: var(--color-accent);
    box-shadow: 0 4px 12px rgba(57, 92, 107, 0.2);
  }

  .mode-btn .icon {
    font-size: 1.5rem;
  }

  .display-mode-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .display-mode-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    padding: 1rem;
    background: white;
    border: 2px solid rgba(57, 92, 107, 0.2);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-heading);
    text-align: left;
  }

  .display-mode-btn:hover {
    border-color: var(--color-accent);
    background: rgba(128, 164, 237, 0.1);
  }

  .display-mode-btn.active {
    background: var(--color-accent);
    color: white;
    border-color: var(--color-accent);
    box-shadow: 0 4px 12px rgba(57, 92, 107, 0.2);
  }

  .mode-label {
    font-size: 1rem;
    font-weight: 600;
  }

  .mode-description {
    font-size: 0.85rem;
    opacity: 0.9;
    font-family: var(--font-body);
  }

  .data-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .data-btn {
    padding: 0.75rem 1.5rem;
    font-family: var(--font-heading);
    font-size: 1rem;
    background: var(--color-accent);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }

  .data-btn:hover {
    background: var(--color-heading);
    transform: translateY(-2px);
  }

  .data-btn.danger {
    background: #e74c3c;
  }

  .data-btn.danger:hover {
    background: #c0392b;
  }

  .import-btn {
    display: block;
  }

  .reset-confirm {
    padding: 1rem;
    background: rgba(231, 76, 60, 0.1);
    border-radius: 10px;
    border: 2px solid #e74c3c;
  }

  .reset-confirm p {
    margin: 0 0 1rem 0;
    font-family: var(--font-heading);
    color: #c0392b;
    text-align: center;
  }

  .reset-actions {
    display: flex;
    gap: 0.5rem;
  }

  .error-message {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: rgba(231, 76, 60, 0.1);
    border-radius: 8px;
    color: #c0392b;
    font-family: var(--font-body);
  }

  .success-message {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: rgba(46, 204, 113, 0.1);
    border-radius: 8px;
    color: #27ae60;
    font-family: var(--font-body);
  }

  .storage-info {
    margin-top: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 10px;
  }

  .storage-info p {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: var(--color-heading);
  }

  .storage-bar {
    height: 8px;
    background: rgba(57, 92, 107, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .storage-fill {
    height: 100%;
    background: var(--color-accent);
    transition: width 0.3s ease;
  }

  .version {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    color: var(--color-text);
  }

  .modal-footer {
    padding: 1.5rem;
    border-top: 2px solid rgba(57, 92, 107, 0.2);
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .footer-btn {
    padding: 0.75rem 2rem;
    font-family: var(--font-heading);
    font-size: 1.25rem;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 10000px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;
  }

  .footer-btn.cancel {
    background: rgba(255, 255, 255, 0.5);
    color: var(--color-heading);
  }

  .footer-btn.cancel:hover {
    background: rgba(255, 255, 255, 0.8);
  }

  .footer-btn.save {
    background: var(--color-accent);
    color: white;
  }

  .footer-btn.save:hover {
    background: var(--color-heading);
    transform: translateY(-2px);
  }

  @media (max-width: 720px) {
    .modal-content {
      max-height: 95vh;
      border-radius: 15px;
    }

    .modal-header h2 {
      font-size: 1.5rem;
    }

    .modal-body {
      padding: 1rem;
    }

    .config-section {
      padding: 1rem;
    }

    .mode-buttons {
      grid-template-columns: 1fr;
    }

    .footer-btn {
      padding: 0.6rem 1.5rem;
      font-size: 1rem;
      min-width: 100px;
    }
  }
</style>
