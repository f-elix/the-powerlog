<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import { LoadEvents } from 'src/machines/log';
	// Svelte
	import { fade } from 'svelte/transition';
	// Machines
	import { log } from 'src/stores/log';
	import { router } from 'src/router/index';
	// ui
	import { ui } from 'src/ui';
	// Components
	import Nav from 'coms/Nav.svelte';
	import Button from 'coms/Button.svelte';
	import Filters from 'coms/Filters.svelte';
	import SessionsList from 'coms/SessionsList.svelte';
	import Fab from 'coms/Fab.svelte';

	export let props: ViewProps;
	export let children: View[];

	const { state: logState, service } = log;
	service.start();

	const onLoadMore = () => {
		log.send({ type: LoadEvents.LOADMORE });
	};

	const onNewSession = () => {
		router.send({ type: 'SESSION_NEW' });
	};

	$: sessions = $logState.context.sessions || [];

	log.send({ type: LoadEvents.LOAD });

</script>

<Nav {props} />
<section class="px-50" in:fade|local={{ duration: 100 }}>
	<Fab label={ui.newSession} on:click={onNewSession} />
	<div class="space-y-70 pt-70">
		<h1 class="text-center text-70 font-bold" class:_disabled={$logState.matches('fetching')}>
			{ui.dashboardTitle}
		</h1>
		<div class="flex flex-col space-y-110 pb-110">
			<Filters />
			{#if $logState.matches('loaded.empty')}
				<h2 class="text-60 text-center text-main opacity-75">{ui.noSessions}</h2>
			{/if}
			{#if $logState.matches('filtered.empty')}
				<h2 class="text-60 text-center text-main opacity-75">
					{ui.noFilteredSessions}
				</h2>
			{/if}
			<SessionsList {sessions} />
			{#if $logState.matches('loaded.normal')}
				<Button theme="success" variant="outlined" on:click={onLoadMore}>
					{ui.loadMore}
				</Button>
			{/if}
		</div>
	</div>
</section>

<style>
	._disabled {
		@apply opacity-50 pointer-events-none;
	}

</style>
