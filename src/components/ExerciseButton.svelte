<script lang="ts">
	// Svelte
	import { getContext } from 'svelte';
	// Types
	import type { ExerciseInstance } from 'types';
	// Stores
	import { session } from 'src/stores/session';
	// Components
	import ExerciseData from 'coms/ExerciseData.svelte';
	import Reorder from 'coms/svg/Reorder.svelte';
	import History from 'coms/svg/History.svelte';
	import Delete from 'coms/svg/Delete.svelte';

	export let instance: ExerciseInstance;
	export let token: string;
	export let index: number;

	const modes: any = getContext('modes');
	const modesState = modes.state;
	const sessionState = session.state;

	const onEditExercise = (instanceId: number) => {
		session.send({ type: 'EDIT_EXERCISE', data: { instanceId } });
	};

	const onDeleteExercise = (instanceId: number) => {
		modes.send({ type: 'DELETE_EXERCISE', data: { instanceId } });
	};

	const onGetExerciseHistory = (exerciseId?: number) => {
		if (!exerciseId) {
			return;
		}
		modes.send({
			type: 'EXERCISE_HISTORY',
			data: { exerciseId, token, date: $sessionState.context.session?.date }
		});
	};
</script>

<button class="w-full" type="button" on:click={() => onEditExercise(instance.id)}>
	<ExerciseData {instance} />
</button>
{#if $modesState.matches('enabled.reordering')}
	<button
		type="button"
		class="absolute top-0 right-0 h-full w-140 {index % 2 === 0
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
{#if $modesState.matches('enabled.history') && instance.exercise?.id}
	<button
		type="button"
		class="absolute top-0 right-0 h-full w-140 {index % 2 === 0
			? 'bg-highlight'
			: 'bg-highlight-light'}"
		aria-label="Exercise history"
		on:click={() => onGetExerciseHistory(instance.exercise?.id)}>
		<div class="flex items-center justify-center">
			<History extClass="w-80 h-80" />
		</div>
	</button>
{/if}
{#if $modesState.matches('enabled.deleting')}
	<button
		type="button"
		class="absolute top-0 right-0 h-full w-140 {index % 2 === 0
			? 'bg-danger-medium'
			: 'bg-danger-light'}"
		aria-label="Delete exercise"
		on:click={() => onDeleteExercise(instance.id)}>
		<div class="flex items-center justify-center">
			<Delete extClass="w-80 h-80" />
		</div>
	</button>
{/if}
