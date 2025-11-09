<script lang="ts">
  export let onPointerDown: ((event: PointerEvent) => void) | null = null;
  export let onKeyDown: ((event: KeyboardEvent) => void) | null = null;
  export let onClick: ((event: MouseEvent) => void) | null = null;
  export let text: string;
</script>

<button
  type="button"
  class="button"
  on:pointerdown={onPointerDown}
  on:click={onClick}
  on:keydown={onKeyDown}
>
  {text}
</button>

<style>
  .button {
    padding: 0.75rem 1.5rem;
    font-family: var(--font-heading);
    font-size: 1.25rem;
    background: var(--color-accent);
    color: white;
    border-radius: 10000px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    text-decoration: none;
    box-shadow: 0 6px 15px rgba(57, 92, 107, 0.2);
    cursor: pointer;
    white-space: nowrap;
    user-select: none;
  }

  .button:focus {
    background: var(--color-heading);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 25px rgba(57, 92, 107, 0.3);
  }

  @media (max-width: 48rem) {
    .button {
      padding: 0.6rem 1rem;
      font-size: 0.95rem;
    }
  }
</style>
