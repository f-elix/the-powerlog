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

	$: console.log($state);

	$: editedExercise = $state.children.exercise;
</script>

<div class="flex flex-col">
	{#if exercises}
		{#each exercises as exercise}
			{#if editedExercise && $state.context.editedInstanceId === exercise.id}
				<ExerciseField service={editedExercise} />
			{:else}
				<button>
					<ExerciseData instance={exercise} />
				</button>
			{/if}
		{/each}
	{/if}
	{#if editedExercise && !$state.context.editedInstanceId}
		<ExerciseField service={editedExercise} />
	{/if}
</div>
