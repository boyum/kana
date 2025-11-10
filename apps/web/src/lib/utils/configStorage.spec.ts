/**
 * Tests for config storage utilities
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  exportAllData,
  downloadExportData,
  importData,
  resetAllData,
  getStorageInfo,
  formatBytes,
  type ExportData,
} from "./configStorage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Replace global localStorage and window with mock
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, "window", {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

// Mock DOM APIs
global.URL = {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
} as unknown as typeof URL;

global.Blob = class Blob {
  constructor(
    public parts: unknown[],
    public options?: { type?: string },
  ) {}
} as unknown as typeof Blob;

global.FileReader = class FileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsText(blob: Blob) {
    setTimeout(() => {
      if (blob.parts && blob.parts[0]) {
        this.result = blob.parts[0] as string;
        if (this.onload) {
          this.onload({ target: this } as ProgressEvent<FileReader>);
        }
      }
    }, 0);
  }

  readAsDataURL(_blob: Blob) {}
  readAsArrayBuffer(_blob: Blob) {}
  readAsBinaryString(_blob: Blob) {}
  abort() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }
  EMPTY = 0;
  LOADING = 1;
  DONE = 2;
  readyState = 0;
  error: DOMException | null = null;
} as unknown as typeof FileReader;

global.File = class File extends Blob {
  constructor(parts: BlobPart[], public name: string, options?: FilePropertyBag) {
    super(parts as unknown[], options);
  }
  lastModified = Date.now();
  webkitRelativePath = "";
  size = 0;
  type = "";
  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0));
  }
  slice(): Blob {
    return new Blob([]);
  }
  stream(): ReadableStream {
    return new ReadableStream();
  }
  text(): Promise<string> {
    return Promise.resolve("");
  }
} as unknown as typeof File;

// Mock document
global.document = {
  createElement: (tag: string) => {
    if (tag === "a") {
      return {
        click: vi.fn(),
        href: "",
        download: "",
      } as unknown as HTMLAnchorElement;
    }
    return {} as never;
  },
} as unknown as Document;

describe("Config storage utilities", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("exportAllData", () => {
    it("should export empty data when storage is empty", () => {
      const data = exportAllData();

      expect(data.config).toBeNull();
      expect(data.customLists).toEqual([]);
      expect(data.performance).toEqual({});
      expect(data.version).toBe("1.0.0");
      expect(data.exportedAt).toBeDefined();
    });

    it("should export config data", () => {
      const config = { theme: "dark", language: "en" };
      localStorage.setItem("kana_app_config", JSON.stringify(config));

      const data = exportAllData();

      expect(data.config).toEqual(config);
    });

    it("should export custom lists", () => {
      const lists = [
        { id: "1", name: "List 1" },
        { id: "2", name: "List 2" },
      ];
      localStorage.setItem("customLists", JSON.stringify(lists));

      const data = exportAllData();

      expect(data.customLists).toEqual(lists);
    });

    it("should export performance data", () => {
      localStorage.setItem(
        "listPerformance_list1",
        JSON.stringify({ views: 10 }),
      );
      localStorage.setItem(
        "listPerformance_list2",
        JSON.stringify({ views: 20 }),
      );

      const data = exportAllData();

      expect(data.performance).toEqual({
        list1: { views: 10 },
        list2: { views: 20 },
      });
    });

    it("should include exportedAt timestamp", () => {
      const before = new Date().toISOString();
      const data = exportAllData();
      const after = new Date().toISOString();

      expect(data.exportedAt).toBeDefined();
      expect(data.exportedAt >= before).toBe(true);
      expect(data.exportedAt <= after).toBe(true);
    });

    it("should handle corrupted performance data gracefully", () => {
      localStorage.setItem("listPerformance_list1", "invalid json");

      const data = exportAllData();

      expect(data.performance).toEqual({});
    });

    it("should export all data types together", () => {
      localStorage.setItem(
        "kana_app_config",
        JSON.stringify({ setting: "value" }),
      );
      localStorage.setItem("customLists", JSON.stringify([{ id: "1" }]));
      localStorage.setItem(
        "listPerformance_list1",
        JSON.stringify({ views: 5 }),
      );

      const data = exportAllData();

      expect(data.config).toEqual({ setting: "value" });
      expect(data.customLists).toEqual([{ id: "1" }]);
      expect(data.performance).toEqual({ list1: { views: 5 } });
    });

    it("should not export non-performance keys", () => {
      localStorage.setItem("someOtherKey", "value");
      localStorage.setItem(
        "listPerformance_list1",
        JSON.stringify({ views: 5 }),
      );

      const data = exportAllData();

      expect(data.performance).toEqual({ list1: { views: 5 } });
      expect(Object.keys(data.performance).length).toBe(1);
    });
  });

  describe("downloadExportData", () => {
    it("should create a blob and download link", () => {
      const clickSpy = vi.fn();
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockReturnValue({
          click: clickSpy,
          href: "",
          download: "",
        } as unknown as HTMLAnchorElement);

      downloadExportData();

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(clickSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should set download filename with current date", () => {
      const anchor = {
        click: vi.fn(),
        href: "",
        download: "",
      };
      vi.spyOn(document, "createElement").mockReturnValue(
        anchor as unknown as HTMLAnchorElement,
      );

      downloadExportData();

      expect(anchor.download).toMatch(/^kana-backup-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  describe("importData", () => {
    it("should import config data", async () => {
      const exportData: ExportData = {
        config: { theme: "dark" } as never,
        customLists: [],
        performance: {},
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      const file = new File([JSON.stringify(exportData)], "backup.json", {
        type: "application/json",
      });

      await importData(file);

      const config = localStorage.getItem("kana_app_config");
      expect(JSON.parse(config!)).toEqual({ theme: "dark" });
    });

    it("should import custom lists", async () => {
      const lists = [{ id: "1", name: "Test List" }];
      const exportData: ExportData = {
        config: null as never,
        customLists: lists,
        performance: {},
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      const file = new File([JSON.stringify(exportData)], "backup.json", {
        type: "application/json",
      });

      await importData(file);

      const customLists = localStorage.getItem("customLists");
      expect(JSON.parse(customLists!)).toEqual(lists);
    });

    it("should import performance data", async () => {
      const exportData: ExportData = {
        config: null as never,
        customLists: [],
        performance: {
          list1: { views: 10 },
          list2: { views: 20 },
        },
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      const file = new File([JSON.stringify(exportData)], "backup.json", {
        type: "application/json",
      });

      await importData(file);

      const perf1 = localStorage.getItem("listPerformance_list1");
      const perf2 = localStorage.getItem("listPerformance_list2");
      expect(JSON.parse(perf1!)).toEqual({ views: 10 });
      expect(JSON.parse(perf2!)).toEqual({ views: 20 });
    });

    it("should reject invalid JSON", async () => {
      const file = new File(["invalid json"], "backup.json", {
        type: "application/json",
      });

      await expect(importData(file)).rejects.toThrow();
    });

    it("should reject invalid backup format", async () => {
      const invalidData = { someKey: "someValue" };
      const file = new File([JSON.stringify(invalidData)], "backup.json", {
        type: "application/json",
      });

      await expect(importData(file)).rejects.toThrow(
        "Invalid backup file format",
      );
    });

    it("should handle partial data", async () => {
      const exportData = {
        config: { theme: "light" },
        customLists: null,
        performance: null,
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      const file = new File([JSON.stringify(exportData)], "backup.json", {
        type: "application/json",
      });

      await importData(file);

      const config = localStorage.getItem("kana_app_config");
      expect(JSON.parse(config!)).toEqual({ theme: "light" });
    });
  });

  describe("resetAllData", () => {
    it("should remove config data", () => {
      localStorage.setItem(
        "kana_app_config",
        JSON.stringify({ setting: "value" }),
      );

      resetAllData();

      expect(localStorage.getItem("kana_app_config")).toBeNull();
    });

    it("should remove custom lists", () => {
      localStorage.setItem("customLists", JSON.stringify([{ id: "1" }]));

      resetAllData();

      expect(localStorage.getItem("customLists")).toBeNull();
    });

    it("should remove all performance data", () => {
      localStorage.setItem(
        "listPerformance_list1",
        JSON.stringify({ views: 10 }),
      );
      localStorage.setItem(
        "listPerformance_list2",
        JSON.stringify({ views: 20 }),
      );
      localStorage.setItem(
        "listPerformance_list3",
        JSON.stringify({ views: 30 }),
      );

      resetAllData();

      expect(localStorage.getItem("listPerformance_list1")).toBeNull();
      expect(localStorage.getItem("listPerformance_list2")).toBeNull();
      expect(localStorage.getItem("listPerformance_list3")).toBeNull();
    });

    it("should not remove other localStorage keys", () => {
      localStorage.setItem("someOtherKey", "value");
      localStorage.setItem("kana_app_config", "config");

      resetAllData();

      expect(localStorage.getItem("someOtherKey")).toBe("value");
    });

    it("should handle empty storage gracefully", () => {
      expect(() => resetAllData()).not.toThrow();
    });
  });

  describe("getStorageInfo", () => {
    it("should return zero usage for empty storage", () => {
      const info = getStorageInfo();

      expect(info.used).toBe(0);
      expect(info.total).toBe(5 * 1024 * 1024);
      expect(info.percentage).toBe(0);
    });

    it("should calculate used space correctly", () => {
      localStorage.setItem("key1", "value1");
      localStorage.setItem("key2", "value2");

      const info = getStorageInfo();

      // "key1" (4) + "value1" (6) = 10
      // "key2" (4) + "value2" (6) = 10
      // Total = 20
      expect(info.used).toBe(20);
    });

    it("should calculate percentage correctly", () => {
      localStorage.setItem("key", "value");

      const info = getStorageInfo();
      const expectedPercentage = (info.used / (5 * 1024 * 1024)) * 100;

      expect(info.percentage).toBe(expectedPercentage);
    });

    it("should have consistent total (5MB)", () => {
      const info = getStorageInfo();

      expect(info.total).toBe(5 * 1024 * 1024);
    });

    it("should handle large data", () => {
      const largeData = "x".repeat(100000);
      localStorage.setItem("largeKey", largeData);

      const info = getStorageInfo();

      expect(info.used).toBeGreaterThan(100000);
      expect(info.percentage).toBeGreaterThan(0);
    });
  });

  describe("formatBytes", () => {
    it("should format 0 bytes", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
    });

    it("should format bytes", () => {
      expect(formatBytes(100)).toBe("100 Bytes");
      expect(formatBytes(512)).toBe("512 Bytes");
    });

    it("should format kilobytes", () => {
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(2048)).toBe("2 KB");
      expect(formatBytes(1536)).toBe("1.5 KB");
    });

    it("should format megabytes", () => {
      expect(formatBytes(1024 * 1024)).toBe("1 MB");
      expect(formatBytes(2 * 1024 * 1024)).toBe("2 MB");
      expect(formatBytes(1.5 * 1024 * 1024)).toBe("1.5 MB");
    });

    it("should round to 2 decimal places", () => {
      expect(formatBytes(1234)).toBe("1.21 KB");
      expect(formatBytes(1536000)).toBe("1.46 MB");
    });

    it("should handle very small values", () => {
      expect(formatBytes(1)).toBe("1 Bytes");
      expect(formatBytes(10)).toBe("10 Bytes");
    });

    it("should handle large MB values", () => {
      expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB");
      expect(formatBytes(10 * 1024 * 1024)).toBe("10 MB");
    });
  });

  describe("Round-trip export/import", () => {
    it("should preserve all data through export and import", async () => {
      // Setup initial data
      localStorage.setItem(
        "kana_app_config",
        JSON.stringify({ theme: "dark" }),
      );
      localStorage.setItem(
        "customLists",
        JSON.stringify([{ id: "1", name: "Test" }]),
      );
      localStorage.setItem(
        "listPerformance_list1",
        JSON.stringify({ views: 10 }),
      );

      // Export
      const exported = exportAllData();

      // Clear storage
      localStorageMock.clear();

      // Create file and import
      const file = new File([JSON.stringify(exported)], "backup.json", {
        type: "application/json",
      });
      await importData(file);

      // Verify
      const config = JSON.parse(
        localStorage.getItem("kana_app_config")!,
      );
      const lists = JSON.parse(localStorage.getItem("customLists")!);
      const perf = JSON.parse(
        localStorage.getItem("listPerformance_list1")!,
      );

      expect(config).toEqual({ theme: "dark" });
      expect(lists).toEqual([{ id: "1", name: "Test" }]);
      expect(perf).toEqual({ views: 10 });
    });
  });
});
