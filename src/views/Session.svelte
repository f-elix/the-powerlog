<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { User } from 'netlify-identity-widget';
	// Machines
	import { router } from 'src/router';
	// Stores
	import { session } from 'src/stores/session';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import SessionView from 'coms/SessionView.svelte';
	import SessionForm from 'coms/SessionForm.svelte';
	import Spinner from 'coms/Spinner.svelte';

	export let props: ViewProps;
	export let children: View[];

	const { context } = props;
	const user = context.user as User;
	const token = user.token?.access_token;
	const sessionId = context.$page?.params?.id;
	const exercises = context.exercises;

	$session.send({ type: 'VIEW', data: { token, sessionId } });

	const onBack = () => {
		router.send('DASHBOARD');
	};

	const onDelete = () => {
		$session.send({ type: 'DELETE', data: { token } });
	};

	const onEdit = () => {
		$session.send({ type: 'EDIT' });
	};

	$: sessionData = $session.state.context.session;
</script>

{#if $session.state.matches('fetching')}
	<div class="flex items-center justify-center h-100vh">
		<Spinner />
	</div>
{/if}
{#if $session.state.matches('displaying') && sessionData}
	<SessionView session={sessionData} on:edit={onEdit} on:delete={onDelete} on:back={onBack} />
{/if}
{#if $session.state.matches('editing')}
	<SessionForm {token} {exercises} title={ui.editingSession} />
{/if}
