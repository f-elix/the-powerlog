<script lang="ts">
	// Types
	import type { ExerciseInstance } from 'types';
	// Components
	import ExerciseExecution from 'coms/ExerciseExecution.svelte';

	export let instance: ExerciseInstance;
	export let isSuperset: boolean = false;
	export let exerciseNum: number = 1;
</script>

<div class="flex flex-col items-start space-y-50 p-50">
	<div class="text-left font-bold text-50">
		{#if isSuperset}
			<span>{exerciseNum})</span>
		{/if}
		<span>{instance.exercise?.name}</span>
	</div>
	{#if instance.executions}
		{#each instance.executions as execution (execution.id)}
			{#if !!execution.sets}
				<ExerciseExecution {execution} />
			{/if}
		{/each}
	{/if}
</div>
