/**
 * Global configuration store using Svelte 5 runes
 * Manages app-wide settings and preferences with localStorage persistence
 */

export type ShuffleMode = "balanced" | "mastery-focused" | "challenge-first";
export type Direction = "front-to-back" | "back-to-front";
export type Language = "en" | "nb";
export type Theme = "light" | "dark" | "auto";

export interface AppConfig {
  // Smart Shuffle Settings
  enableSmartShuffle: boolean;
  defaultShuffleMode: ShuffleMode;
  maxShuffleSize: number;

  // Default Direction
  defaultDirection: Direction;

  // Language
  language: Language;

  // Appearance (future)
  theme: Theme;
  reducedMotion: boolean;

  // Meta
  version: string;
}

const CONFIG_VERSION = "1.0.0";
const STORAGE_KEY = "kana_app_config";

const DEFAULT_CONFIG: AppConfig = {
  enableSmartShuffle: true,
  defaultShuffleMode: "balanced",
  maxShuffleSize: 25,
  defaultDirection: "front-to-back",
  language: "nb",
  theme: "light",
  reducedMotion: false,
  version: CONFIG_VERSION,
};

/**
 * Config store class using Svelte 5 runes
 */
class ConfigStore {
  config = $state<AppConfig>(DEFAULT_CONFIG);
  isLoaded = $state<boolean>(false);

  constructor() {
    this.loadConfig();
  }

  /**
   * Load config from localStorage or use defaults
   */
  private loadConfig() {
    if (typeof window === "undefined") {
      this.isLoaded = true;
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppConfig;

        // Handle version migration if needed
        if (parsed.version !== CONFIG_VERSION) {
          this.config = this.migrateConfig(parsed);
        } else {
          this.config = { ...DEFAULT_CONFIG, ...parsed };
        }
      }
    } catch (error) {
      console.error("Error loading config from localStorage:", error);
      this.config = DEFAULT_CONFIG;
    }

    this.isLoaded = true;
  }

  /**
   * Save config to localStorage
   */
  private saveConfig() {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error("Error saving config to localStorage:", error);
    }
  }

  /**
   * Migrate config from older versions
   */
  private migrateConfig(oldConfig: Partial<AppConfig>): AppConfig {
    // For now, just merge with defaults and update version
    // In the future, add specific migration logic here
    return {
      ...DEFAULT_CONFIG,
      ...oldConfig,
      version: CONFIG_VERSION,
    };
  }

  /**
   * Update config with partial values
   */
  updateConfig(updates: Partial<AppConfig>) {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * Reset config to defaults
   */
  resetConfig() {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
  }

  /**
   * Get the full config (derived)
   */
  get current(): AppConfig {
    return this.config;
  }

  /**
   * Individual config getters for convenience
   */
  get enableSmartShuffle(): boolean {
    return this.config.enableSmartShuffle;
  }

  get defaultShuffleMode(): ShuffleMode {
    return this.config.defaultShuffleMode;
  }

  get maxShuffleSize(): number {
    return this.config.maxShuffleSize;
  }

  get defaultDirection(): Direction {
    return this.config.defaultDirection;
  }

  get language(): Language {
    return this.config.language;
  }

  get theme(): Theme {
    return this.config.theme;
  }

  get reducedMotion(): boolean {
    return this.config.reducedMotion;
  }
}

export const configStore = new ConfigStore();
