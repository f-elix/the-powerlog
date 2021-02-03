<script lang="ts">
	import type { Execution } from 'types';
	import { SetType } from 'src/utils';

	export let execution: Execution;
</script>

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
