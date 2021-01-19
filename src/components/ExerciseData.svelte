<script lang="ts">
	// Types
	import { SetType } from 'src/utils';
	import type { Performance } from 'types';

	export let performance: Performance;
</script>

<div class="flex flex-col items-start space-y-50 p-50">
	{#each performance.exerciseInstances as instance (instance.id)}
		<span class="font-bold text-50">{instance.exercise?.name}</span>
		{#each instance.executions as execution (execution.id)}
			{#if !!execution.sets}
				<div class="flex items-center space-x-50 text-40">
					<span>{execution.sets}</span>
					<span>X</span>
					{#if execution.setType === SetType.time}
						<div>
							<span>{execution.duration.amount || 0}</span>
							<span>{execution.duration.unit}</span>
						</div>
					{:else}<span>{execution.reps || 0}</span>{/if}
					<span>|</span>
					<div>
						{#if execution.load.bodyweight}<span>Bodyweight + </span>{/if}
						<span>{execution.load.amount || 0}</span>
						<span>{execution.load.unit}</span>
					</div>
				</div>
			{/if}
		{/each}
	{/each}
</div>
