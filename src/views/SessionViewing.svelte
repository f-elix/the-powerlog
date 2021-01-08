<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { User } from 'netlify-identity-widget';
	// Machines
	import { router } from 'src/router';
	// Stores
	import { session } from 'src/stores/session';
	// Utils
	import { getLocalDate, days } from 'src/utils';
	// Components
	import Button from 'coms/Button.svelte';

	export let props: ViewProps;
	export let children: View[];

	const { state, send, service } = session;

	const { context } = props;
	const user = context.user as User;
	const token = user.token?.access_token;
	const sessionId = context.$page?.params?.id;

	service.start();
	send({ type: 'VIEW', data: { token, sessionId } });

	const onBack = () => {
		router.send('DASHBOARD');
	};

	const onDelete = () => {
		session.send({ type: 'DELETE', data: { token } });
	};

	$: sessionData = $state.context.session;
</script>

{#if $state.matches('displaying') && sessionData}
	<section class="flex flex-col min-h-100vh py-100">
		<div class="text-center">
			<h1 class="px-50 text-70 font-bold">{sessionData.title}</h1>
			<h2>{days[getLocalDate(sessionData.date).getDay()]} {sessionData.date}</h2>
		</div>
		<div class="flex flex-col space-y-70 mt-auto px-50">
			<Button theme="success">Edit</Button>
			<Button theme="danger" on:click={onDelete}>Delete</Button>
			<Button variant="outlined" on:click={onBack}>Back</Button>
		</div>
	</section>
{/if}
