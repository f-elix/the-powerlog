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

	export let props: ViewProps;
	export let children: View[];

	const user = props.context.user as User;

	log.send({ type: 'LOAD', data: { token: user.token?.access_token } });
</script>

<section class="space-y-70 px-50 h-full overflow-y-auto">
	<div class="flex items-center justify-center relative py-50">
		<Logout extClass="absolute left-0" />
		<h1 class="text-70 font-bold">{ui.dashboardTitle}</h1>
	</div>
	<div class="flex flex-col space-y-110">
		<Filters />
		<SessionsList />
		<Button theme="success" variant="outlined">{ui.loadMore}</Button>
	</div>
	<Fab label={ui.newSession} />
</section>
