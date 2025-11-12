<svelte:options runes={true} />

<script lang="ts">
  import { supabase } from '$lib/supabase';

  let loading = $state(false);
  let error = $state<string | null>(null);

  async function signInWithGitHub() {
    loading = true;
    error = null;

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to sign in';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Admin Login - Kana</title>
</svelte:head>

<div class="container">
  <div class="card">
    <h1>Kana Admin</h1>
    <p class="subtitle">Sign in to access the admin dashboard</p>

    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}

    <button
      class="github-btn"
      onclick={signInWithGitHub}
      disabled={loading}
    >
      {loading ? 'Signing in...' : 'Sign in with GitHub'}
    </button>

    <p class="note">
      Admin access required. Contact the system administrator if you need access.
    </p>
  </div>
</div>

<style>
  .container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .card {
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 3rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }

  .error-message {
    background: #fee;
    color: var(--error-color);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .github-btn {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    font-weight: 600;
    background: #24292e;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .github-btn:hover:not(:disabled) {
    background: #1b1f23;
  }

  .github-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .note {
    margin-top: 1.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  @media (max-width: 640px) {
    .card {
      padding: 2rem;
    }

    h1 {
      font-size: 1.5rem;
    }
  }
</style>
