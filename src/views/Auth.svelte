<script lang="ts">
	import netlifyIdentity from 'netlify-identity-widget';
	import type { View } from '../lib/router/types';
	import Button from 'coms/Button.svelte';
	import Icon from 'coms/Icon.svelte';
	import { ui } from 'src/ui';

	export let props: Record<string, unknown>;
	export let children: View[];

	const onLogin = () => {
		netlifyIdentity.open('login');
	};
	const onSignUp = () => {
		netlifyIdentity.open('signup');
	};
</script>

<section class="flex flex-col items-center justify-center h-100vh space-y-110">
	<div class="flex flex-col items-center space-y-110 max-w-180 mx-auto px-50 text-center">
		<Icon />
		<h1 class="text-70 font-bold">{ui.appName}</h1>
		<h2 class="text-50">{ui.tagline}</h2>
	</div>
	<div class="flex flex-col space-y-50 w-full px-50">
		<Button theme="info" on:click={onLogin}>{ui.login}</Button>
		<Button theme="info" variant="outlined" on:click={onSignUp}>{ui.signup}</Button>
	</div>
</section>
