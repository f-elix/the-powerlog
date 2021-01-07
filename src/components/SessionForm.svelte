<script lang="ts">
	// Stores
	import { edit } from 'src/stores/edit';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import SessionExercises from 'coms/SessionExercises.svelte';
	import Button from 'coms/Button.svelte';
	import Fab from 'coms/Fab.svelte';
	import Label from 'coms/Label.svelte';

	export let token: string;

	const { state } = edit;

	let form: HTMLFormElement;

	const onSave = () => {
		edit.send({ type: 'SAVE', data: { token } });
	};

	const onNameInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		edit.send({ type: 'TITLE_INPUT', data: { value: target.value } });
	};

	const onDateInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		edit.send({ type: 'DATE_INPUT', data: { value: target.value } });
	};

	const onCancel = () => {
		edit.send({ type: 'DELETE', data: { token } });
	};

	const onNewExercise = () => {
		edit.send({ type: 'EDIT_EXERCISE' });
	};

	const focusInput: () => void = (node: HTMLInputElement) => {
		node.focus();
	};

	$: session = $state.context.session;
	$: exercises = $state.context.exercises;
</script>

{#if $state.matches('editing') && session}
	<form bind:this={form} on:submit|preventDefault={onSave} novalidate>
		<datalist id="exercises">
			{#each exercises as exercise (exercise.id)}
				<option value={exercise.name} data-id={exercise.id} />
			{/each}
		</datalist>
		<Fab variant="outlined" label={ui.newExercise} on:click={onNewExercise} />
		<div class="flex flex-col space-y-110">
			<div class="flex flex-col space-y-70 px-50">
				<Label>
					<span>Name</span>
					<input
						use:focusInput
						type="text"
						name="title"
						value={session.title}
						on:input={onNameInput} />
				</Label>
				<Label>
					<span>Date</span>
					<input type="date" name="date" value={session.date} on:input={onDateInput} />
				</Label>
			</div>
			<SessionExercises exercises={session.exercises} />
			<div class="flex flex-col space-y-70 px-50">
				<Button type="submit" theme="success">Save</Button>
				<Button theme="danger" on:click={onCancel}>Cancel</Button>
			</div>
		</div>
	</form>
{/if}
