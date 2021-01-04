<script lang="ts">
	// Machines
	import { edit } from 'src/stores/edit';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import ExerciseFields from 'coms/ExerciseFields.svelte';
	import Button from 'coms/Button.svelte';
	import Fab from 'coms/Fab.svelte';

	export let token: string;

	const { state } = edit;

	let form: HTMLFormElement;

	const onSave = (e: Event) => {
		// edit.send({ type: 'SAVE', data: { formData } });
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

	const focusInput: () => void = (node: HTMLInputElement) => {
		node.focus();
	};

	$: session = $state.context.session;
</script>

{#if $state.matches('editing') && session}
	<form bind:this={form} on:submit|preventDefault={onSave} novalidate>
		<Fab variant="outlined" label={ui.newExercise} />
		<div class="flex flex-col space-y-110">
			<div class="flex flex-col space-y-70 px-50">
				<label class="_input flex flex-col">
					<span>Name</span>
					<input
						use:focusInput
						type="text"
						name="title"
						value={session.title}
						on:input={onNameInput} />
				</label>
				<label class="_input flex flex-col">
					<span>Date</span>
					<input type="date" name="date" value={session.date} on:input={onDateInput} />
				</label>
			</div>
			<ExerciseFields />
			<div class="flex flex-col space-y-70 px-50">
				<Button type="submit" theme="success">Save</Button>
				<Button theme="danger" on:click={onCancel}>Cancel</Button>
			</div>
		</div>
	</form>
{/if}
