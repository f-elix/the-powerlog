<script lang="ts">
	// Types
	import type { ExerciseInstance } from 'types';

	export let instance: ExerciseInstance;
</script>

<div class="flex flex-col"><span class="font-bold">{instance.exercise?.name}</span></div>
