<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { User } from 'netlify-identity-widget';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import ExercisesFilter from 'coms/ExercisesFilter.svelte';

	export let props: ViewProps;
	export let children: View[];
	g;
</script>

<section class="space-y-70 p-70">
	<h1 class="text-center text-70 font-bold">{ui.exercisesTitle}</h1>
	<ExercisesFilter />
</section>
