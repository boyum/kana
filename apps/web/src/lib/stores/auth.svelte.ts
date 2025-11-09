import { supabase } from "$lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

/**
 * Auth store using Svelte 5 runes
 * Manages authentication state for both registered users and guests
 */
class AuthStore {
  user = $state<User | null>(null);
  session = $state<Session | null>(null);
  isGuest = $state<boolean>(false);
  loading = $state<boolean>(true);

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Check for existing session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    this.session = session;
    this.user = session?.user ?? null;

    // Check if user is anonymous (guest)
    if (session?.user) {
      this.isGuest = session.user.is_anonymous ?? false;
    } else {
      // Check localStorage for guest mode preference
      this.isGuest = localStorage.getItem("kana_guest_mode") === "true";
    }

    this.loading = false;

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      this.session = session;
      this.user = session?.user ?? null;
      this.isGuest = session?.user?.is_anonymous ?? false;

      // Update localStorage
      if (this.isGuest && !session) {
        localStorage.setItem("kana_guest_mode", "true");
      } else if (session) {
        localStorage.removeItem("kana_guest_mode");
      }
    });
  }

  /**
   * Sign in with GitHub OAuth
   */
  async signInWithGitHub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error signing in with GitHub:", error);
      throw error;
    }
  }

  /**
   * Continue as guest (anonymous user)
   */
  async continueAsGuest() {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error("Error signing in as guest:", error);
      throw error;
    }

    this.isGuest = true;
    localStorage.setItem("kana_guest_mode", "true");
    return data;
  }

  /**
   * Convert guest account to permanent account via GitHub
   */
  async linkGitHubAccount() {
    if (!this.isGuest || !this.user) {
      throw new Error("Can only link accounts for guest users");
    }

    const { error } = await supabase.auth.linkIdentity({
      provider: "github",
    });

    if (error) {
      console.error("Error linking GitHub account:", error);
      throw error;
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }

    this.user = null;
    this.session = null;
    this.isGuest = false;
    localStorage.removeItem("kana_guest_mode");
  }

  /**
   * Check if user is authenticated (either as guest or registered user)
   */
  get isAuthenticated() {
    return this.user !== null;
  }

  /**
   * Check if user is a registered (non-guest) user
   */
  get isRegistered() {
    return this.user !== null && !this.isGuest;
  }
}

export const authStore = new AuthStore();
