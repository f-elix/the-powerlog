<script lang="ts">
	import netlifyIdentity from 'netlify-identity-widget';
	import type { View } from '../lib/router/types';

	export let props: Record<string, unknown>;
	export let children: View[];

	const onLogin = () => {
		netlifyIdentity.open('login');
	};
	const onSignUp = () => {
		netlifyIdentity.open('signup');
	};
</script>

<h1>Auth</h1>
<button on:click={onLogin}>Login</button>
<button on:click={onSignUp}>Sign Up</button>
