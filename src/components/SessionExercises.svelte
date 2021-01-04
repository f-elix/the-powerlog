<script lang="ts">
	// Types
	import type { ExerciseInstance } from 'types';
	// Stores
	import { edit } from 'src/stores/edit';
	// Components
	import CardExercise from 'coms/CardExercise.svelte';
	import ExerciseField from 'coms/ExerciseField.svelte';

	export let exercises: ExerciseInstance[];

	const { state } = edit;

	$: editedExercise = $state.children.exercise;
</script>

{#if exercises}
	{#each exercises as exercise}
		<CardExercise {exercise} />
	{/each}
{/if}
{#if editedExercise}
	<ExerciseField service={editedExercise} />
{/if}
