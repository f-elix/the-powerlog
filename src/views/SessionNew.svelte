<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { User } from 'netlify-identity-widget';
	// Svelte
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	// Stores
	import { session } from 'src/stores/session';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import SessionForm from 'coms/SessionForm.svelte';
	import Spinner from 'coms/Spinner.svelte';

	export let props: ViewProps;
	export let children: View[];

	const { context } = props;
	const user = context.user as User;
	const token = user.token?.access_token;
	const exercises = context.exercises;

	$session.send({ type: 'CREATE', data: { token } });
</script>

<section class="space-y-100 pb-160" in:fly|local={{ y: -60, easing: expoOut, duration: 600 }}>
	{#if $session.state.matches('fetching')}
		<div class="flex items-center justify-center h-100vh">
			<Spinner />
		</div>
	{/if}
	{#if $session.state.matches('editing')}
		<SessionForm {token} {exercises} title={ui.creatingSession} />
	{/if}
</section>
