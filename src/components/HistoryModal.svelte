<script lang="ts">
	// Svelte
	import { createEventDispatcher } from 'svelte';
	// Types
	import type { ExerciseInstance } from 'types';
	// Components
	import ExerciseData from 'coms/ExerciseData.svelte';
	import Button from 'coms/Button.svelte';

	export let instance: ExerciseInstance;

	const dispatch = createEventDispatcher();

	const onDone = () => {
		dispatch('done');
	};
</script>

<div class="fixed z-50 inset-0 px-50 pt-120 bg-white bg-opacity-50">
	<div class="flex flex-col space-y-70 p-70 rounded-10 bg-main shadow-2xl">
		<h2 class="text-50 font-bold">Last performance</h2>
		{#if instance}
			<ExerciseData {instance} />
		{/if}
		<Button theme="info" on:click={onDone}>Done</Button>
	</div>
</div>
