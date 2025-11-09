/**
 * Utilities for managing config-related data in localStorage
 * Handles data export, import, and storage management
 */

import type { AppConfig } from "$lib/stores/config.svelte";

const CONFIG_KEY = "kana_app_config";
const LISTS_KEY = "customLists"; // Existing key for custom lists
const PERFORMANCE_KEY_PREFIX = "listPerformance_"; // Existing prefix for performance data

export interface ExportData {
  config: AppConfig;
  customLists: unknown[]; // Will contain the actual custom lists
  performance: Record<string, unknown>; // Performance data by list ID
  exportedAt: string;
  version: string;
}

/**
 * Export all app data (config, custom lists, performance data)
 */
export function exportAllData(): ExportData {
  const config = localStorage.getItem(CONFIG_KEY);
  const customLists = localStorage.getItem(LISTS_KEY);

  // Collect all performance data
  const performance: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PERFORMANCE_KEY_PREFIX)) {
      const listId = key.replace(PERFORMANCE_KEY_PREFIX, "");
      const data = localStorage.getItem(key);
      if (data) {
        try {
          performance[listId] = JSON.parse(data);
        } catch (error) {
          console.error(`Error parsing performance data for ${listId}:`, error);
        }
      }
    }
  }

  return {
    config: config ? JSON.parse(config) : null,
    customLists: customLists ? JSON.parse(customLists) : [],
    performance,
    exportedAt: new Date().toISOString(),
    version: "1.0.0",
  };
}

/**
 * Download export data as a JSON file
 */
export function downloadExportData() {
  const data = exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kana-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import data from a file
 */
export async function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportData;

        // Validate the data structure
        if (!data.config && !data.customLists && !data.performance) {
          throw new Error("Invalid backup file format");
        }

        // Import config
        if (data.config) {
          localStorage.setItem(CONFIG_KEY, JSON.stringify(data.config));
        }

        // Import custom lists
        if (data.customLists) {
          localStorage.setItem(LISTS_KEY, JSON.stringify(data.customLists));
        }

        // Import performance data
        if (data.performance) {
          Object.entries(data.performance).forEach(([listId, perfData]) => {
            localStorage.setItem(
              `${PERFORMANCE_KEY_PREFIX}${listId}`,
              JSON.stringify(perfData)
            );
          });
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Reset all app data (config, custom lists, performance)
 */
export function resetAllData() {
  // Remove config
  localStorage.removeItem(CONFIG_KEY);

  // Remove custom lists
  localStorage.removeItem(LISTS_KEY);

  // Remove all performance data
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PERFORMANCE_KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  used: number;
  total: number;
  percentage: number;
} {
  // Check if we're in a browser environment
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return {
      used: 0,
      total: 5 * 1024 * 1024,
      percentage: 0,
    };
  }

  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      used += key.length + (value?.length || 0);
    }
  }

  // localStorage typically has 5-10MB limit, we'll estimate 5MB
  const total = 5 * 1024 * 1024; // 5MB in bytes
  const percentage = (used / total) * 100;

  return {
    used,
    total,
    percentage,
  };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
