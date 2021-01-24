<script lang="ts">
	import RouterView from './lib/router/RouterView.svelte';
	import { router } from './router';
</script>

<main class="max-w-ip mx-auto">
	<RouterView {router} />
</main>
