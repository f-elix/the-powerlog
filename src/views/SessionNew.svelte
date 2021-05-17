<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	// Svelte
	import { fade } from 'svelte/transition';
	// Stores
	import { session } from 'src/stores/session';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import SessionForm from 'coms/SessionForm.svelte';

	export let props: ViewProps;
	export let children: View[];

	const { state: sessionState, service } = session;
	service.start();

	const { context } = props;
	const exercises = context.exercises;

	session.send({ type: 'CREATE' });

</script>

{#if $sessionState.matches('editing')}
	<section class="space-y-100 pb-160" in:fade|local={{ duration: 100 }}>
		<SessionForm {exercises} title={ui.creatingSession} />
	</section>
{/if}
