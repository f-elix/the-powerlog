<script lang="ts">
	// Types
	import type { Exercise } from 'types';
	// Svelte
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	// Components
	import CardExercise from 'coms/CardExercise.svelte';

	export let exercises: Exercise[] = [];
</script>

<ul class="flex flex-col space-y-50">
	{#each exercises as exercise, i}
		<li
			class="flex flex-col"
			in:fly={{ y: -30, easing: expoOut, duration: 400, delay: i * 20 }}
		>
			<CardExercise {exercise} />
		</li>
	{/each}
</ul>
