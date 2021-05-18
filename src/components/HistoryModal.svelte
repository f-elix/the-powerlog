<script lang="ts">
	// Types
	import type { Session } from 'types';
	import { formatDate, getLocalDate, SetType } from 'src/utils';
	import type { Modes } from 'src/machines/session';
	// Svelte
	import { createEventDispatcher, getContext } from 'svelte';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import Button from 'coms/Button.svelte';
	import Spinner from 'coms/Spinner.svelte';
	import Modal from 'coms/Modal.svelte';

	export let session: Partial<Session>;

	const dispatch = createEventDispatcher();

	const modes: Modes = getContext('modes');

	const onDone = () => {
		dispatch('done');
	};

	$: performances = session?.performances || [];
	$: exerciseName = performances[0]?.exerciseInstances[0].exercise?.name;

</script>

<Modal
	id="history"
	isOpen={$modes.matches('enabled.history.fetching') || $modes.matches('enabled.history.loaded')}
>
	{#if $modes.matches('enabled.history.fetching')}
		<Spinner />
	{/if}
	{#if $modes.matches('enabled.history.loaded')}
		{#if performances.length}
			<div class="space-y-70">
				<h2 class="text-60 font-bold">
					{ui.historyTitle(exerciseName)}
				</h2>
				{#if session.date}
					<h3 class="font-bold">
						{formatDate(getLocalDate(session.date))}
					</h3>
				{/if}
			</div>
			<div class="space-y-70">
				{#each performances as performance}
					{#each performance.exerciseInstances as instance}
						{#each instance.executions as execution}
							<div class="flex items-center justify-center space-x-50 text-40">
								<span>{execution.sets}</span>
								<span>X</span>
								{#if execution.setType === SetType.time}
									<div>
										<span>{execution.duration.amount || 0}</span>
										<span>{execution.duration.unit}</span>
									</div>
								{:else}<span>{execution.reps || 0}</span>{/if}
								<span>|</span>
								<div>
									{#if execution.load.bodyweight}<span>Bodyweight + </span>{/if}
									<span>{execution.load.amount || 0}</span>
									<span>{execution.load.unit}</span>
								</div>
							</div>
						{/each}
					{/each}
				{/each}
			</div>
		{:else}
			<h2 class="text-50 font-bold opacity-50">
				No performance recorded for this exercise yet.
			</h2>
		{/if}
	{/if}
	<Button theme="info" on:click={onDone}>Done</Button>
</Modal>
