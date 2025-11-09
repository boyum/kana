<script lang="ts">
  import { supabase } from '$lib/supabase';

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }
</script>

<svelte:head>
  <title>Unauthorized - Kana Admin</title>
</svelte:head>

<div class="container">
  <div class="card">
    <h1>🚫 Unauthorized</h1>
    <p class="message">
      You do not have administrator access to this application.
    </p>
    <p class="submessage">
      Please contact the system administrator if you believe this is an error.
    </p>
    <button class="sign-out-btn" onclick={signOut}>
      Sign Out
    </button>
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
    max-width: 500px;
    width: 100%;
    text-align: center;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .message {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
  }

  .submessage {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }

  .sign-out-btn {
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .sign-out-btn:hover {
    background: var(--accent-hover);
  }
</style>
