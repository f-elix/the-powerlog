<script lang="ts">
	// Types
	import type { ExerciseInstance } from 'types';
	// Stores
	import { session } from 'src/stores/session';
	// Components
	import ExerciseData from 'coms/ExerciseData.svelte';
	import ExerciseField from 'coms/ExerciseField.svelte';
	import HistoryModal from 'coms/HistoryModal.svelte';
	import Reorder from 'coms/svg/Reorder.svelte';
	import History from 'coms/svg/History.svelte';
	import Delete from 'coms/svg/Delete.svelte';

	export let exercises: ExerciseInstance[];
	export let modes: any;
	export let token: string;

	const sessionState = session.state;
	$: modesState = modes?.state;

	const onEditExercise = (index: number) => {
		session.send({ type: 'EDIT_EXERCISE', data: { instanceIndex: index } });
	};

	const onDeleteExercise = (index: number) => {
		modes.send({ type: 'DELETE_EXERCISE', data: { instanceIndex: index } });
	};

	const onGetExerciseHistory = (exerciseId?: number) => {
		if (!exerciseId) {
			return;
		}
		modes.send({ type: 'EXERCISE_HISTORY', data: { exerciseId, token } });
	};

	const onHistoryDismiss = () => {
		modes.send({ type: 'DISMISS' });
	};

	$: editedExercise = $sessionState.children.exercise;
	$: editedIndex = $sessionState.context.editedIndex;
	$: historyInstance = $modesState?.context.history;
</script>

<style>
	._disabled {
		opacity: 0.25;
	}

	._disabled button {
		cursor: default;
	}
</style>

<div class="flex flex-col">
	{#if $modesState.matches('history.loaded')}
		<HistoryModal instance={historyInstance} on:done={onHistoryDismiss} />
	{/if}
	{#if exercises}
		{#each exercises as instance, i}
			{#if $sessionState.matches('editing.exercise.editing') && i === editedIndex}
				<ExerciseField service={editedExercise} />
			{:else}
				<div
					class="relative flex bg-fg-light odd:bg-fg"
					class:_disabled={$sessionState.matches('editing.exercise.editing') && i !== editedIndex}>
					<button class="w-full" type="button" on:click={() => onEditExercise(i)}>
						<ExerciseData {instance} />
					</button>
					{#if $modesState.matches('reordering')}
						<button
							type="button"
							class="absolute top-0 right-0 h-full w-140 {i % 2 === 0 ? 'bg-info-light' : 'bg-info-lighter'}"
							aria-label="Drag handle">
							<div class="flex items-center justify-center">
								<Reorder extClass="w-80 h-80" />
							</div>
						</button>
					{/if}
					{#if $modesState.matches('history') && instance.exercise?.id}
						<button
							type="button"
							class="absolute top-0 right-0 h-full w-140 {i % 2 === 0 ? 'bg-highlight' : 'bg-highlight-light'}"
							aria-label="Exercise history"
							on:click={() => onGetExerciseHistory(instance.exercise?.id)}>
							<div class="flex items-center justify-center">
								<History extClass="w-80 h-80" />
							</div>
						</button>
					{/if}
					{#if $modesState.matches('deleting')}
						<button
							type="button"
							class="absolute top-0 right-0 h-full w-140 {i % 2 === 0 ? 'bg-danger-medium' : 'bg-danger-light'}"
							aria-label="Delete exercise"
							on:click={() => onDeleteExercise(i)}>
							<div class="flex items-center justify-center">
								<Delete extClass="w-80 h-80" />
							</div>
						</button>
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
	{#if $sessionState.matches('editing.exercise.creating')}
		<ExerciseField service={editedExercise} />
	{/if}
</div>
