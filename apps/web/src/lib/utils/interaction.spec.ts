/**
 * Tests for interaction utilities
 */
import { describe, it, expect, vi } from "vitest";
import {
  createInteractionHandlers,
  handleLinkClick,
  getRandomPlaceholderName,
} from "./interaction";

// Mock PointerEvent and KeyboardEvent for Node environment
global.PointerEvent = class PointerEvent extends Event {
  isPrimary: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;

  constructor(type: string, init?: PointerEventInit) {
    super(type, init);
    this.isPrimary = init?.isPrimary ?? false;
    this.ctrlKey = init?.ctrlKey ?? false;
    this.metaKey = init?.metaKey ?? false;
    this.shiftKey = init?.shiftKey ?? false;
    this.altKey = init?.altKey ?? false;
  }
} as never;

global.KeyboardEvent = class KeyboardEvent extends Event {
  key: string;

  constructor(type: string, init?: KeyboardEventInit) {
    super(type, init);
    this.key = init?.key ?? "";
  }
} as never;

describe("Interaction utilities", () => {
  describe("createInteractionHandlers", () => {
    it("should create handlers with onPointerDown and onKeyDown", () => {
      const callback = vi.fn();
      const handlers = createInteractionHandlers(callback);

      expect(handlers).toHaveProperty("onPointerDown");
      expect(handlers).toHaveProperty("onKeyDown");
      expect(typeof handlers.onPointerDown).toBe("function");
      expect(typeof handlers.onKeyDown).toBe("function");
    });

    it("should call callback on primary pointer down", () => {
      const callback = vi.fn();
      const handlers = createInteractionHandlers(callback);

      const event = new PointerEvent("pointerdown", {
        isPrimary: true,
        cancelable: true,
      });
      handlers.onPointerDown(event);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it("should not call callback on non-primary pointer", () => {
      const callback = vi.fn();
      const handlers = createInteractionHandlers(callback);

      const event = new PointerEvent("pointerdown", {
        isPrimary: false,
        cancelable: true,
      });
      handlers.onPointerDown(event);

      expect(callback).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it("should call callback on Enter key", () => {
      const callback = vi.fn();
      const handlers = createInteractionHandlers(callback);

      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        cancelable: true,
      });
      handlers.onKeyDown(event);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it("should call callback on Space key", () => {
      const callback = vi.fn();
      const handlers = createInteractionHandlers(callback);

      const event = new KeyboardEvent("keydown", {
        key: " ",
        cancelable: true,
      });
      handlers.onKeyDown(event);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it("should not call callback on other keys", () => {
      const callback = vi.fn();
      const handlers = createInteractionHandlers(callback);

      const event = new KeyboardEvent("keydown", {
        key: "Escape",
        cancelable: true,
      });
      handlers.onKeyDown(event);

      expect(callback).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it("should handle multiple invocations", () => {
      const callback = vi.fn();
      const handlers = createInteractionHandlers(callback);

      const event1 = new PointerEvent("pointerdown", {
        isPrimary: true,
        cancelable: true,
      });
      const event2 = new KeyboardEvent("keydown", {
        key: "Enter",
        cancelable: true,
      });

      handlers.onPointerDown(event1);
      handlers.onKeyDown(event2);

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe("handleLinkClick", () => {
    it("should navigate using goto for primary pointer without modifiers", () => {
      const gotoFn = vi.fn();
      const event = new PointerEvent("pointerdown", {
        isPrimary: true,
        cancelable: true,
      });

      handleLinkClick(event, "/test-page", gotoFn);

      expect(gotoFn).toHaveBeenCalledWith("/test-page");
      expect(event.defaultPrevented).toBe(true);
    });

    it("should not navigate for non-primary pointer", () => {
      const gotoFn = vi.fn();
      const event = new PointerEvent("pointerdown", {
        isPrimary: false,
        cancelable: true,
      });

      handleLinkClick(event, "/test-page", gotoFn);

      expect(gotoFn).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it("should not prevent default when Ctrl key is pressed", () => {
      const gotoFn = vi.fn();
      const event = new PointerEvent("pointerdown", {
        isPrimary: true,
        ctrlKey: true,
        cancelable: true,
      });

      handleLinkClick(event, "/test-page", gotoFn);

      expect(gotoFn).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it("should not prevent default when Meta key is pressed", () => {
      const gotoFn = vi.fn();
      const event = new PointerEvent("pointerdown", {
        isPrimary: true,
        metaKey: true,
        cancelable: true,
      });

      handleLinkClick(event, "/test-page", gotoFn);

      expect(gotoFn).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it("should not prevent default when Shift key is pressed", () => {
      const gotoFn = vi.fn();
      const event = new PointerEvent("pointerdown", {
        isPrimary: true,
        shiftKey: true,
        cancelable: true,
      });

      handleLinkClick(event, "/test-page", gotoFn);

      expect(gotoFn).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it("should not prevent default when Alt key is pressed", () => {
      const gotoFn = vi.fn();
      const event = new PointerEvent("pointerdown", {
        isPrimary: true,
        altKey: true,
        cancelable: true,
      });

      handleLinkClick(event, "/test-page", gotoFn);

      expect(gotoFn).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it("should handle different href formats", () => {
      const gotoFn = vi.fn();
      const event = new PointerEvent("pointerdown", {
        isPrimary: true,
        cancelable: true,
      });

      handleLinkClick(event, "/path/to/page", gotoFn);
      expect(gotoFn).toHaveBeenCalledWith("/path/to/page");

      const event2 = new PointerEvent("pointerdown", {
        isPrimary: true,
        cancelable: true,
      });
      handleLinkClick(event2, "/page#anchor", gotoFn);
      expect(gotoFn).toHaveBeenCalledWith("/page#anchor");
    });
  });

  describe("getRandomPlaceholderName", () => {
    it("should return a string", () => {
      const name = getRandomPlaceholderName();

      expect(typeof name).toBe("string");
      expect(name.length).toBeGreaterThan(0);
    });

    it("should return one of the predefined placeholder names", () => {
      const validNames = [
        "Japanese glossary",
        "Bones in the human body",
        "Common French verbs",
        "World capitals",
        "Periodic table elements",
        "Famous paintings",
        "Programming languages",
        "Historical events",
        "Mathematical formulas",
        "Popular movie quotes",
      ];

      const name = getRandomPlaceholderName();

      expect(validNames).toContain(name);
    });

    it("should potentially return different names on multiple calls", () => {
      // Get 50 samples and check if we got at least 2 different values
      // This test has a very small chance of failing if Math.random is very unlucky
      const names = new Set<string>();
      for (let i = 0; i < 50; i++) {
        names.add(getRandomPlaceholderName());
      }

      // With 50 calls and 10 options, we should get multiple unique values
      expect(names.size).toBeGreaterThan(1);
    });

    it("should never return undefined or empty string", () => {
      for (let i = 0; i < 20; i++) {
        const name = getRandomPlaceholderName();
        expect(name).toBeDefined();
        expect(name).not.toBe("");
      }
    });
  });
});
