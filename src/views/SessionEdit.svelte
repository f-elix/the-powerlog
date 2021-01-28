<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	// Svelte
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
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

	const { context } = props;
	const { exercises, session: sessionData } = context;
	const sessionId = context.$page?.params?.id || '';

	if (sessionData && sessionData.id === parseInt(sessionId, 10)) {
		$session.send({ type: 'EDIT', data: { session: sessionData } });
	} else {
		router.send({ type: 'VIEW', params: { id: sessionId } });
	}
</script>

<section class="space-y-100 pb-160" in:fly|local={{ y: -60, easing: expoOut, duration: 600 }}>
	{#if $session.state.matches('fetching')}
		<div class="flex items-center justify-center h-100vh">
			<Spinner />
		</div>
	{/if}
	{#if $session.state.matches('editing')}
		<SessionForm {exercises} title={ui.editingSession} />
	{/if}
</section>
