<script lang="ts">
	import netlifyIdentity from 'netlify-identity-widget';
	import type { View } from '../lib/router/types';

	export let props: Record<string, unknown>;
	export let children: View[];

	const onLogout = () => {
		netlifyIdentity.logout();
	};
</script>

<h1>Dashboard</h1>
<button on:click={onLogout}>Logout</button>
