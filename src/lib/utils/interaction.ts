/**
 * Creates a combined event handler for both pointer and keyboard interactions.
 * This is mobile-first and prevents double-tap zoom on iOS.
 * 
 * @param callback - The function to call when the interaction occurs
 * @returns An object with pointerdown and keydown event handlers
 */
export function createInteractionHandlers(callback: () => void) {
  return {
    onPointerDown: (e: PointerEvent) => {
      // Only respond to primary pointer (first touch or left mouse button)
      if (e.isPrimary) {
        e.preventDefault();
        callback();
      }
    },
    onKeyDown: (e: KeyboardEvent) => {
      // Activate on Enter or Space
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback();
      }
    }
  };
}
