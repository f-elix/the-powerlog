<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { User } from 'netlify-identity-widget';
	// Machines
	import { log } from '@/stores/log';
	// ui
	import { ui } from '@/ui';
	// Components
	import Button from '@/components/Button.svelte';
	import Logout from '@/components/Logout.svelte';
	import Filters from '@/components/Filters.svelte';
	import SessionsList from '@/components/SessionsList.svelte';
	import Fab from '@/components/Fab.svelte';

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
