<script lang="ts">
	// Types
	import type { Exercise } from 'types';
	// Components
	import Button from 'coms/Button.svelte';

	export let exercise: Exercise;
</script>

<Button theme="info" href="/exercises/{exercise.id}">
	{exercise.name}
</Button>
