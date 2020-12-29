<script lang="ts">
	import netlifyIdentity from 'netlify-identity-widget';
	import RouterView from './lib/router/RouterView.svelte';
	import { router } from './router';

	const onLogout = () => {
		netlifyIdentity.logout();
	};
</script>

<button on:click={onLogout}>Logout</button>
<RouterView {router} />
