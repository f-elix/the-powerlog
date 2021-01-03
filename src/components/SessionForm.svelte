<script lang="ts">
	// Svelte
	import { createEventDispatcher } from 'svelte';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import ExerciseFields from 'coms/ExerciseFields.svelte';
	import Button from 'coms/Button.svelte';
	import Fab from 'coms/Fab.svelte';

	const dispatch = createEventDispatcher();

	const today = new Date().toLocaleDateString('en-CA');

	const onCancel = () => {
		dispatch('cancel');
	};
</script>

<form on:submit|preventDefault novalidate>
	<Fab variant="outlined" label={ui.newExercise} />
	<div class="flex flex-col space-y-110">
		<div class="flex flex-col space-y-70 px-50">
			<label class="_input flex flex-col">
				<span>Name</span>
				<input type="text" name="title" />
			</label>
			<label class="_input flex flex-col">
				<span>Date</span>
				<input type="date" name="date" value={today} />
			</label>
		</div>
		<ExerciseFields />
		<div class="flex flex-col space-y-70 px-50">
			<Button type="submit" theme="success">Save</Button>
			<Button theme="danger" on:click={onCancel}>Cancel</Button>
		</div>
	</div>
</form>
