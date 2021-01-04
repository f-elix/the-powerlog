<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { User } from 'netlify-identity-widget';
	// Machines
	import { log } from 'src/stores/log';
	import { filters } from 'src/stores/filters';
	import { router } from 'src/router/index';
	// ui
	import { ui } from 'src/ui';
	// Components
	import Button from 'coms/Button.svelte';
	import Logout from 'coms/Logout.svelte';
	import Filters from 'coms/Filters.svelte';
	import SessionsList from 'coms/SessionsList.svelte';
	import Fab from 'coms/Fab.svelte';
	import Spinner from 'coms/Spinner.svelte';

	export let props: ViewProps;
	export let children: View[];

	log.start();

	const { state: logState } = log;
	const { state: filtersState } = filters;
	const user = props.context.user as User;
	const token = user.token?.access_token;

	const onLoadMore = () => {
		log.send({ type: 'LOAD_MORE', data: { token } });
	};

	const onNewSession = () => {
		router.send({ type: 'SESSION_NEW' });
	};

	$: sessions = $logState.context.sessions || [];
	$: filteredSessions = $filtersState.context.sessions || [];

	log.send({ type: 'LOAD', data: { token } });
</script>

<section class="space-y-70 px-50 h-full overflow-y-auto">
	<Fab label={ui.newSession} on:click={onNewSession} />
	<div class="flex items-center justify-center relative py-50">
		<Logout extClass="absolute left-0" />
		<h1 class="text-70 font-bold">{ui.dashboardTitle}</h1>
	</div>
	<div class="flex flex-col space-y-110 pb-110">
		<Filters {token} />
		{#if $filtersState.matches('idle.clear')}
			{#if $logState.matches('loaded.empty')}
				<h2 class="text-60 text-center text-main opacity-75">{ui.noSessions}</h2>
			{/if}
			{#if $logState.matches('loaded') || $logState.matches('fetching')}
				<SessionsList {sessions} />
			{/if}
			{#if $logState.matches('fetching')}
				<Spinner />
			{/if}
			{#if $logState.matches('loaded.normal')}
				<Button theme="success" variant="outlined" on:click={onLoadMore}>
					{ui.loadMore}
				</Button>
			{/if}
		{:else}
			<SessionsList sessions={filteredSessions} />
			{#if $filtersState.matches('idle.error')}
				<h2 class="text-60 text-center text-main opacity-75">{ui.noSessions}</h2>
			{/if}
		{/if}
	</div>
</section>
