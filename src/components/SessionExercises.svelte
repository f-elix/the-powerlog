<script lang="ts">
	// Types
	import type { ExerciseInstance } from 'types';
	// Stores
	import { session } from 'src/stores/session';
	// Components
	import ExerciseData from 'coms/ExerciseData.svelte';
	import ExerciseField from 'coms/ExerciseField.svelte';

	export let exercises: ExerciseInstance[];

	const { state } = session;

	const onEditExercise = (index: number) => {
		session.send({ type: 'EDIT_EXERCISE', data: { instanceIndex: index } });
	};

	$: console.log($state);

	$: editedExercise = $state.children.exercise;
	$: editedIndex = $state.context.editedIndex;
</script>

<div class="flex flex-col">
	{#if exercises}
		{#each exercises as exercise, i}
			{#if $state.matches('editing.exercise.editing') && i === editedIndex}
				<ExerciseField service={editedExercise} />
			{:else}
				<button type="button" on:click={() => onEditExercise(i)}>
					<ExerciseData instance={exercise} />
				</button>
			{/if}
		{/each}
	{/if}
	{#if $state.matches('editing.exercise.creating')}
		<ExerciseField service={editedExercise} />
	{/if}
</div>
