<script lang="ts">
	import RouterView from './lib/router/RouterView.svelte';
	import { router } from './router';
</script>

<div class="max-w-ip mx-auto h-100vh">
	<RouterView {router} />
</div>
