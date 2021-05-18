<script lang="ts">
	import { getContext } from 'svelte';
	import netlifyIdentity from 'netlify-identity-widget';
	import type { View } from '../lib/router/types';
	import Button from 'coms/Button.svelte';
	import Icon from 'coms/Icon.svelte';
	import SignupModal from 'coms/SignupModal.svelte';
	import { ui } from 'src/ui';
	import type { BeforeInstallPromptEvent } from 'types';
	import type { Writable } from 'svelte/store';

	export let props: Record<string, unknown>;
	export let children: View[];

	let installButton: HTMLElement;

	const installPrompt: Writable<BeforeInstallPromptEvent | null> = getContext('installPrompt');

	$: $installPrompt && installButton && installButton.removeAttribute('hidden');

	const onInstall = () => {
		if (!$installPrompt) {
			installButton.setAttribute('hidden', 'true');
			return;
		}
		$installPrompt.prompt();
		$installPrompt.userChoice.then((choice) => {
			if (choice.outcome === 'accepted') {
				installButton.setAttribute('hidden', 'true');
			}
			$installPrompt = null;
		});
	};

	const onLogin = () => {
		// netlifyIdentity.open('login');
	};
	const onSignUp = () => {
		// netlifyIdentity.open('signup');
	};

</script>

<section class="flex flex-col items-center justify-center h-100vh space-y-110">
	<div class="flex flex-col items-center space-y-80 max-w-180 mx-auto px-50 text-center">
		<Icon />
		<h1 class="text-70 font-bold">{ui.appName}</h1>
		<h2 class="text-50">{ui.tagline}</h2>
		<button
			bind:this={installButton}
			on:click={onInstall}
			id="install"
			class="px-40 py-30 rounded-10 bg-fg transition-colors pointer:hover:bg-fg-light _focus-default"
			hidden
			><span class="flex items-center space-x-30">
				<svg
					class="w-60 h-60"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
					/>
				</svg><span>Install</span>
			</span></button
		>
	</div>
	<div class="flex flex-col space-y-50 w-full px-50">
		<Button theme="info" on:click={onLogin}>{ui.login}</Button>
		<SignupModal />
	</div>
</section>
