<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
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
	const exercises = context.exercises;

	$session.send({ type: 'CREATE' });
</script>

<section class="space-y-100 pb-160" in:fly|local={{ y: -60, easing: expoOut, duration: 600 }}>
	{#if $session.state.matches('fetching')}
		<div class="flex items-center justify-center h-100vh">
			<Spinner />
		</div>
	{/if}
	{#if $session.state.matches('editing')}
		<SessionForm {exercises} title={ui.creatingSession} />
	{/if}
</section>
