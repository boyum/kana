<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import Button from './Button.svelte';

	let menuOpen = $state(false);
	let loading = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	async function handleSignOut() {
		try {
			loading = true;
			await authStore.signOut();
			closeMenu();
			goto('/');
		} catch (error) {
			console.error('Error signing out:', error);
			loading = false;
		}
	}

	async function handleLinkGitHub() {
		try {
			loading = true;
			await authStore.linkGitHubAccount();
			closeMenu();
		} catch (error) {
			console.error('Error linking GitHub account:', error);
			loading = false;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (menuOpen && !(event.target as Element).closest('.user-menu')) {
			closeMenu();
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

{#if authStore.isAuthenticated}
	<div class="user-menu">
		<button class="user-button" onclick={toggleMenu} aria-label="User menu" aria-expanded={menuOpen}>
			{#if authStore.isGuest}
				<div class="avatar guest">
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
						/>
					</svg>
				</div>
				<span class="user-label">Guest</span>
			{:else}
				<div class="avatar registered">
					{#if authStore.user?.user_metadata?.avatar_url}
						<img src={authStore.user.user_metadata.avatar_url} alt="User avatar" />
					{:else}
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
							/>
						</svg>
					{/if}
				</div>
				<span class="user-label">
					{authStore.user?.user_metadata?.full_name ||
						authStore.user?.user_metadata?.user_name ||
						authStore.user?.email ||
						'User'}
				</span>
			{/if}
			<svg class="chevron" class:open={menuOpen} viewBox="0 0 24 24" fill="currentColor">
				<path d="M7 10l5 5 5-5z" />
			</svg>
		</button>

		{#if menuOpen}
			<div class="dropdown">
				<div class="user-info">
					{#if authStore.isGuest}
						<p class="user-type">Guest Account</p>
						<p class="user-description">Lists saved locally</p>
					{:else}
						<p class="user-type">Registered Account</p>
						<p class="user-description">{authStore.user?.email || 'No email'}</p>
					{/if}
				</div>

				<div class="menu-divider"></div>

				<div class="menu-items">
					{#if authStore.isGuest}
						<button class="menu-item" onclick={handleLinkGitHub} disabled={loading}>
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
								/>
							</svg>
							Link GitHub Account
						</button>
					{/if}

					<button class="menu-item" onclick={handleSignOut} disabled={loading}>
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
							/>
						</svg>
						Sign Out
					</button>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<Button onClick={() => goto('/login')}>
		Sign In
	</Button>
{/if}

<style>
	.user-menu {
		position: relative;
	}

	.user-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: white;
		border: 2px solid var(--color-accent);
		border-radius: 10000px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: var(--font-heading);
		font-size: 1rem;
	}

	.user-button:hover {
		background: var(--color-accent);
		color: white;
	}

	.user-button:hover .avatar {
		border-color: white;
	}

	.avatar {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--color-accent);
		transition: border-color 0.2s ease;
	}

	.avatar.guest {
		background: #e2e8f0;
		color: #64748b;
	}

	.avatar.registered {
		background: var(--color-accent);
		color: white;
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.user-label {
		font-weight: 500;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chevron {
		width: 1.25rem;
		height: 1.25rem;
		transition: transform 0.2s ease;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		background: white;
		border: 2px solid var(--color-accent);
		border-radius: 1rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
		min-width: 250px;
		z-index: 100;
		animation: slideDown 0.2s ease;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.user-info {
		padding: 1rem;
	}

	.user-type {
		font-weight: 600;
		color: var(--color-heading);
		margin-bottom: 0.25rem;
	}

	.user-description {
		font-size: 0.875rem;
		color: #64748b;
	}

	.menu-divider {
		height: 1px;
		background: #e2e8f0;
		margin: 0 1rem;
	}

	.menu-items {
		padding: 0.5rem;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		color: var(--color-text);
		text-align: left;
		transition: background 0.2s ease;
	}

	.menu-item:hover:not(:disabled) {
		background: #f8fafc;
	}

	.menu-item:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.menu-item svg {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
	}
</style>
