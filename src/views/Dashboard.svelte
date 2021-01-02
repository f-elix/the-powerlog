<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { User } from 'netlify-identity-widget';
	// Machines
	import { log } from 'src/stores/log';
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

	const { state } = log;
	const user = props.context.user as User;

	const onLoad = () => {
		log.send({ type: 'LOAD', data: { token: user.token?.access_token } });
	};

	onLoad();
</script>

<section class="space-y-70 px-50 h-full overflow-y-auto">
	<div class="flex items-center justify-center relative py-50">
		<Logout extClass="absolute left-0" />
		<h1 class="text-70 font-bold">{ui.dashboardTitle}</h1>
	</div>
	<div class="flex flex-col space-y-110 pb-110">
		<Filters />
		{#if $state.matches('loaded.empty')}
			<h2 class="text-60 text-center text-main opacity-75">{ui.noSessions}</h2>
		{/if}
		{#if $state.matches('loaded') || $state.matches('fetching')}
			<SessionsList />
		{/if}
		{#if $state.matches('fetching')}
			<Spinner />
		{/if}
		{#if $state.matches('loaded.normal')}
			<Button theme="success" variant="outlined" on:click={onLoad}>{ui.loadMore}</Button>
		{/if}
	</div>
	<Fab label={ui.newSession} />
</section>
