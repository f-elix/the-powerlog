<script lang="ts">
	// Types
	import type { Exercise } from 'types';
	import type { View, ViewProps } from '../lib/router/types';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import Nav from 'coms/Nav.svelte';
	import ExercisesFilter from 'coms/ExercisesFilter.svelte';
	import ExercisesList from 'coms/ExercisesList.svelte';

	export let props: ViewProps;
	export let children: View[];

	const exercises: Exercise[] = props.context.exercises || [];

	let filter = '';

	$: filteredExercises =
		filter.length > 0
			? exercises.filter((ex) => ex.name.toLowerCase().includes(filter))
			: exercises;

	const onSearchExercises = (e: Event) => {
		const input = e.currentTarget as HTMLInputElement;
		filter = input.value;
	};
</script>

<Nav {props} />
<section class="space-y-70 p-70">
	<h1 class="text-center text-70 font-bold">{ui.exercisesTitle}</h1>
	<ExercisesFilter on:input={onSearchExercises} />
	<ExercisesList exercises={filteredExercises} />
</section>
