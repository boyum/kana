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
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        callback();
      }
    },
  };
}

/**
 * Creates a pointer event handler for internal link navigation.
 * This prevents the 300ms delay on mobile devices.
 * Note: This should be used with on:pointerdown on <a> tags alongside the href attribute.
 * The href attribute is kept for accessibility, SEO, and when modifier keys are used.
 *
 * @param e - The pointer event
 * @param href - The URL to navigate to
 * @param gotoFn - The SvelteKit goto function (import from '$app/navigation')
 */
export function handleLinkClick(
  e: PointerEvent,
  href: string,
  gotoFn: (url: string) => void,
) {
  // Only respond to primary pointer (first touch or left mouse button)
  if (!e.isPrimary) return;

  // Check for modifier keys - if present, let the browser handle it normally
  // This allows users to open in new tab (cmd/ctrl + click) etc.
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
    return;
  }

  // Prevent default navigation and use SvelteKit's client-side routing
  e.preventDefault();
  gotoFn(href);
}

// Utility function to provide random placeholder names for custom lists
const placeholderNames = [
  "Japansk ordliste",
  "Bein i menneskekroppen",
  "Vanlige franske verb",
  "Verdens hovedsteder",
  "Periodesystemets elementer",
  "Berømte malerier",
  "Programmeringsspråk",
  "Historiske hendelser",
  "Matematiske formler",
  "Populære filmtitater"
];

/**
 * Returns a random placeholder name from the list.
 * @returns {string} A random placeholder name.
 */
export function getRandomPlaceholderName() {
  const randomIndex = Math.floor(Math.random() * placeholderNames.length);
  return placeholderNames[randomIndex];
}
