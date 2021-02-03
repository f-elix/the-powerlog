<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	// Svelte
	import { fade } from 'svelte/transition';
	// Machines
	import { log } from 'src/stores/log';
	import { filters } from 'src/stores/filters';
	import { router } from 'src/router/index';
	// ui
	import { ui } from 'src/ui';
	// Components
	import Nav from 'coms/Nav.svelte';
	import Button from 'coms/Button.svelte';
	import Filters from 'coms/Filters.svelte';
	import SessionsList from 'coms/SessionsList.svelte';
	import Fab from 'coms/Fab.svelte';
	import ProgressBar from 'src/components/ProgressBar.svelte';

	export let props: ViewProps;
	export let children: View[];

	const onLoadMore = () => {
		$log.send({ type: 'LOAD_MORE' });
	};

	const onNewSession = () => {
		router.send({ type: 'SESSION_NEW' });
	};

	$: sessions = $log.state.context.sessions || [];
	$: filteredSessions = $filters.state.context.sessions || [];

	$log.send({ type: 'LOAD' });
</script>

<Nav {props} />
<section class="px-50" in:fade|local={{ duration: 100 }}>
	{#if $log.state.matches('fetching') || $filters.state.matches('fetching')}
		<ProgressBar />
	{/if}
	<Fab label={ui.newSession} on:click={onNewSession} />
	<div class="space-y-70 pt-70">
		<h1 class="text-center text-70 font-bold" class:_disabled={$log.state.matches('fetching')}>
			{ui.dashboardTitle}
		</h1>
		<div class="flex flex-col space-y-110 pb-110">
			{#if !$log.state.matches('loaded.empty') && !$log.state.matches('fetching')}
				<Filters />
			{/if}
			{#if $filters.state.matches('idle.clear')}
				{#if $log.state.matches('loaded.empty')}
					<h2 class="text-60 text-center text-main opacity-75">{ui.noSessions}</h2>
				{/if}
				{#if $log.state.matches('loaded') || $log.state.matches('fetching')}
					<SessionsList {sessions} />
				{/if}

				{#if $log.state.matches('loaded.normal')}
					<Button theme="success" variant="outlined" on:click={onLoadMore}>
						{ui.loadMore}
					</Button>
				{/if}
			{:else}
				<SessionsList sessions={filteredSessions} />
				{#if $filters.state.matches('idle.error')}
					<h2 class="text-60 text-center text-main opacity-75">
						{ui.noFilteredSessions}
					</h2>
				{/if}
			{/if}
		</div>
	</div>
</section>

<style>
	._disabled {
		@apply opacity-50 pointer-events-none;
	}
</style>
