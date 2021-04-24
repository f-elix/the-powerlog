<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import RouterView from './lib/router/RouterView.svelte';
	import { router } from './router';
	import type { BeforeInstallPromptEvent } from 'types';

	const installPrompt = writable<BeforeInstallPromptEvent | null>(null);
	setContext('installPrompt', installPrompt);

	const saveBeforeInstallPromptEvent = (e: BeforeInstallPromptEvent) => {
		$installPrompt = e;
	};

	onMount(() => {
		window.addEventListener('beforeinstallprompt', saveBeforeInstallPromptEvent);
	});
</script>

<main class="max-w-ip mx-auto">
	<RouterView {router} />
</main>

<style global>
	@import '../styles/main.css';
</style>
