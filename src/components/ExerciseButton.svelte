<script lang="ts">
	// Types
	import type { UseServiceOutput } from 'src/lib/xstate-svelte';
	import type { ExerciseInstance, Performance } from 'types';
	// Svelte
	import { getContext } from 'svelte';
	// Stores
	import { session } from 'src/stores/session';
	// Components
	import ExerciseData from 'coms/ExerciseData.svelte';
	import Reorder from 'coms/svg/Reorder.svelte';
	import History from 'coms/svg/History.svelte';
	import Delete from 'coms/svg/Delete.svelte';

	export let performance: Performance;
	export let token: string;
	export let index: number;

	const modes: UseServiceOutput = getContext('modes');

	let instances: ExerciseInstance[];
	$: instances = performance.exerciseInstances;

	const onEditPerformance = () => {
		$session.send({ type: 'EDIT_PERFORMANCE', data: { performanceId: performance.id } });
	};

	const onDeletePerformance = (instanceId: number) => {
		$modes.send({
			type: 'DELETE_EXERCISE',
			data: { performanceId: performance.id, instanceId }
		});
	};

	const onGetExerciseHistory = (exerciseId?: number) => {
		if (!exerciseId) {
			return;
		}
		$modes.send({
			type: 'EXERCISE_HISTORY',
			data: { exerciseId, token, date: $session.state.context.session?.date }
		});
	};
</script>

<div class="flex w-full">
	<div class="flex flex-col w-full">
		{#each instances as instance, i}
			<div class="flex w-full">
				<button class="w-full" type="button" on:click={onEditPerformance}>
					<ExerciseData
						{instance}
						isSuperset={instances.length > 1}
						exerciseNum={i + 1}
					/>
				</button>
				{#if $modes.state.matches('enabled.reordering')}
					<button
						type="button"
						class="w-140 {index % 2 === 0
							? 'bg-info-light'
							: 'bg-info-lighter'} cursor-grab"
						aria-label="Drag handle"
						on:pointerdown
						on:touchstart|preventDefault={() => {}}>
						<div class="flex items-center justify-center">
							<Reorder extClass="w-80 h-80" />
						</div>
					</button>
				{/if}
				{#if $modes.state.matches('enabled.history') && instance.exercise?.id}
					<button
						type="button"
						class="w-140 {index % 2 === 0 ? 'bg-highlight' : 'bg-highlight-light'}"
						aria-label="Exercise history"
						on:click={() => onGetExerciseHistory(instance.exercise?.id)}>
						<div class="flex items-center justify-center">
							<History extClass="w-80 h-80" />
						</div>
					</button>
				{/if}
				{#if $modes.state.matches('enabled.deleting')}
					<button
						type="button"
						class="w-140 {index % 2 === 0 ? 'bg-danger-medium' : 'bg-danger-light'}"
						aria-label="Delete exercise"
						on:click={() => onDeletePerformance(instance.id)}>
						<div class="flex items-center justify-center">
							<Delete extClass="w-80 h-80" />
						</div>
					</button>
				{/if}
			</div>
		{/each}
	</div>
	{#if $modes.state.matches('enabled.reordering')}
		<button
			type="button"
			class="h-full w-1/4 {index % 2 === 0 ? 'bg-info-light' : 'bg-info-lighter'} cursor-grab"
			aria-label="Drag handle"
			on:pointerdown
			on:touchstart|preventDefault={() => {}}>
			<div class="flex items-center justify-center">
				<Reorder extClass="w-80 h-80" />
			</div>
		</button>
	{/if}
</div>
