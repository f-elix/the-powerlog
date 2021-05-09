<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	// Svelte
	import { fade } from 'svelte/transition';
	// Router
	import { router } from 'src/router';
	// Stores
	import { session } from 'src/stores/session';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import SessionForm from 'coms/SessionForm.svelte';
	import Spinner from 'coms/Spinner.svelte';

	export let props: ViewProps;
	export let children: View[];

	const { state: sessionState, service } = session;
	service.start();

	const { context } = props;
	const { exercises, session: sessionData } = context;
	const sessionId = context.$page?.params?.id || '';

	if (sessionData && sessionData.id === parseInt(sessionId, 10)) {
		session.send({ type: 'EDIT', data: { session: JSON.parse(JSON.stringify(sessionData)) } }); // Copy session object
	} else {
		// Redirect if url session id doesn't match in-memory session id
		router.send({ type: 'VIEW', params: { id: sessionId } });
	}
</script>

<section class="space-y-100 pb-160" in:fade|local={{ duration: 100 }}>
	{#if $sessionState.matches('fetching')}
		<div class="flex items-center justify-center h-100vh">
			<Spinner />
		</div>
	{/if}
	{#if $sessionState.matches('editing')}
		<SessionForm {exercises} title={ui.editingSession} />
	{/if}
</section>
