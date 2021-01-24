<script lang="ts">
	// Types
	import type { User } from 'netlify-identity-widget';
	import type { View, ViewProps } from '../lib/router/types';
	import type { Performance, Session } from 'types';
	// Router
	import { router } from 'src/router';
	// Stores
	import { session } from 'src/stores/session';
	// Utils
	import { getLocalDate, days } from 'src/utils';
	// Components
	import ExerciseData from 'coms/ExerciseData.svelte';
	import Button from 'coms/Button.svelte';
	import Spinner from 'coms/Spinner.svelte';

	export let props: ViewProps;
	export let children: View[];

	const { context } = props;
	const user = context.user as User;
	const token = user.token?.access_token;
	const sessionId = context.$page?.params?.id || '';

	let sessionData: Session;
	let performances: Performance[];
	$: sessionData = context.session || $session.state.context.session;
	$: performances = sessionData?.performances || [];

	if (context.session && context.session.id === parseInt(sessionId, 10)) {
		$session.send({ type: 'DISPLAY', data: { sessionData } });
	} else {
		$session.send({ type: 'GET_SESSION', data: { token, sessionId } });
	}

	const onBack = () => {
		router.send('DASHBOARD');
	};

	const onDelete = () => {
		$session.send({ type: 'DELETE', data: { token } });
	};

	const onEdit = () => {
		router.send({ type: 'EDIT', params: { id: sessionId }, data: { session: sessionData } });
	};
</script>

<section class="flex flex-col min-h-100vh space-y-100 py-100">
	{#if $session.state.matches('fetching')}
		<div class="flex items-center justify-center h-100vh">
			<Spinner />
		</div>
	{/if}
	{#if $session.state.matches('displaying') && sessionData}
		<div class="space-y-40 text-center">
			<h1 class="px-50 text-70 font-bold">{sessionData.title}</h1>
			<h2>
				<span>{days[getLocalDate(sessionData.date).getDay()]}</span>
				<span>{sessionData.date.split('T')[0]}</span>
			</h2>
			{#if sessionData.bodyweightAmount}
				<p>
					Bodyweight: <span class="font-bold"
						>{sessionData.bodyweightAmount} {sessionData.bodyweightUnit}</span
					>
				</p>
			{/if}
		</div>
		<ul>
			{#each performances as performance (performance.id)}
				<li class="bg-fg-light odd:bg-fg">
					{#each performance.exerciseInstances as instance, i}
						<ExerciseData
							{instance}
							isSuperset={performance.exerciseInstances.length > 1}
							exerciseNum={i + 1}
						/>
					{/each}
				</li>
			{/each}
		</ul>
	{/if}

	<div class="flex flex-col space-y-70 px-50">
		<Button theme="success" on:click={onEdit}>Edit</Button>
		<Button theme="danger" on:click={onDelete}>Delete</Button>
		<Button variant="outlined" on:click={onBack}>Back</Button>
	</div>
</section>
