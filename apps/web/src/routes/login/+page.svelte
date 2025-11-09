<script lang="ts">
  import { authStore } from "$lib/stores/auth.svelte";
  import { goto } from "$app/navigation";
  import Button from "$lib/components/Button.svelte";
  import * as m from "$lib/paraglide/messages";

  let loading = $state(false);
  let error = $state<string | null>(null);

  async function handleGitHubLogin() {
    try {
      loading = true;
      error = null;
      await authStore.signInWithGitHub();
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to sign in with GitHub";
      loading = false;
    }
  }

  async function handleGuestLogin() {
    try {
      loading = true;
      error = null;
      await authStore.continueAsGuest();
      goto("/");
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to continue as guest";
      loading = false;
    }
  }

  // Redirect if already authenticated
  $effect(() => {
    if (authStore.isAuthenticated && !authStore.loading) {
      goto("/");
    }
  });
</script>

<svelte:head>
  <title>Login - Kana</title>
</svelte:head>

<div class="login-container">
  <div class="login-card">
    <h1>Welcome to Kana</h1>
    <p class="subtitle">Learn Japanese characters with flashcards</p>

    <div class="login-options">
      <div class="option-section">
        <h2>Create Account</h2>
        <p class="option-description">
          Sign in to save your custom lists to the cloud and access them from
          any device.
        </p>
        <Button onClick={handleGitHubLogin}>
          <svg
            class="github-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          Continue with GitHub
        </Button>
      </div>

      <div class="divider">
        <span>or</span>
      </div>

      <div class="option-section">
        <h2>Continue as Guest</h2>
        <p class="option-description">
          Try the app without an account. Your custom lists will be stored
          locally on this device.
        </p>
        <Button onClick={handleGuestLogin}>Continue as Guest</Button>
      </div>
    </div>

    {#if error}
      <div class="error-message" role="alert">
        {error}
      </div>
    {/if}

    <div class="features">
      <h3>Features</h3>
      <ul>
        <li>Learn Hiragana and Katakana with spaced repetition</li>
        <li>Create and share custom vocabulary lists</li>
        <li>Track your learning progress</li>
        <li>Smart shuffle algorithm for better retention</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .login-card {
    background: white;
    border-radius: 1rem;
    padding: 3rem;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 0.5rem;
    color: #1a202c;
  }

  .subtitle {
    text-align: center;
    color: #718096;
    margin-bottom: 2rem;
  }

  .login-options {
    margin-bottom: 2rem;
  }

  .option-section {
    margin-bottom: 1.5rem;
  }

  .option-section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #2d3748;
  }

  .option-description {
    font-size: 0.875rem;
    color: #718096;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 2rem 0;
    color: #a0aec0;
  }

  .divider::before,
  .divider::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #e2e8f0;
  }

  .divider span {
    padding: 0 1rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .github-icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.5rem;
  }

  .error-message {
    background-color: #fed7d7;
    color: #9b2c2c;
    padding: 0.75rem;
    border-radius: 0.5rem;
    margin-top: 1rem;
    font-size: 0.875rem;
  }

  .features {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
  }

  .features h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2d3748;
  }

  .features ul {
    list-style: none;
    padding: 0;
  }

  .features li {
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
    position: relative;
    font-size: 0.875rem;
    color: #4a5568;
  }

  .features li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #667eea;
    font-weight: bold;
  }

  @media (max-width: 640px) {
    .login-card {
      padding: 2rem;
    }

    h1 {
      font-size: 1.5rem;
    }
  }
</style>
