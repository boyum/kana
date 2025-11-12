<svelte:options runes={true} />

<script lang="ts">
	import '../app.css';
	import { setLocale, getLocale } from "$lib/paraglide/runtime";
	import { onMount } from "svelte";
	import { configStore } from "$lib/stores/config.svelte";
	import { dev } from '$app/environment';

	let { children, data } = $props();

	// Track the current locale to force re-renders across the app
	// This key will change whenever locale changes, causing child components to re-render
	let localeKey = $state(0);

	// Initialize locale from server data or config store
	onMount(() => {
		const initialLocale = getLocale();

		// Check if user has a stored config in localStorage
		const hasStoredConfig = typeof localStorage !== 'undefined' && localStorage.getItem('kana_app_config') !== null;

		if (!hasStoredConfig) {
			// First-time user - detect language from browser
			const browserLang = navigator.language.toLowerCase();
			const langCode = browserLang.split('-')[0];

			// Map Norwegian variants (no, nn, nb) to nb, everything else to en
			const detectedLocale = ['no', 'nn', 'nb'].includes(langCode) ? 'nb' : 'en';

			// Update config store with detected language
			configStore.updateConfig({ language: detectedLocale });

			if (detectedLocale !== initialLocale) {
				setLocale(detectedLocale, { reload: false });
				localeKey++;
			}
		} else {
			// Returning user - use stored language preference
			const storedLanguage = configStore.language;
			if (storedLanguage !== initialLocale) {
				setLocale(storedLanguage, { reload: false });
				localeKey++;
			}
		}

		// Register service worker only in production mode
		if (!dev && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js').catch((error) => {
				console.error('Service worker registration failed:', error);
			});
		}
	});

	// Watch for config language changes and update locale immediately
	$effect(() => {
		const language = configStore.language;
		const locale = getLocale();

		if (language !== locale) {
			setLocale(language, { reload: false });
			// Increment key to force re-render of all children
			localeKey++;
		}
	});
</script>

{#key localeKey}
	<div class="app">
		<main>
			{@render children()}
		</main>
	</div>
{/key}

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
