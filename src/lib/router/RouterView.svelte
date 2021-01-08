<script lang="ts">
	import { writable } from 'svelte/store';

	import type { Router, View } from './types';

	export let router: Router;

	const views = writable([] as View[], (set) => {
		router.getViews((list: View[]) => {
			set(list);
		});
	});
</script>

{#if router && $views}
	{#each $views as view}
		<svelte:component this={view.component} props={view.props} children={view.children} />
	{/each}
{/if}
