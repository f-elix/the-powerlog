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
</script>

<Nav {props} />
<section class="space-y-70 p-70">
	<h1 class="text-center text-70 font-bold">{ui.exercisesTitle}</h1>
	<ExercisesFilter />
	<ExercisesList {exercises} />
</section>
