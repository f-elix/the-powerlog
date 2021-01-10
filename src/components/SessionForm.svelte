<script lang="ts">
	// Types
	import type { Exercise } from 'types';
	import type { Modes } from 'src/machines/session';
	// // xstate-svelte
	import { useService } from 'xstate-svelte';
	// Stores
	import { session } from 'src/stores/session';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import SessionModes from 'coms/SessionModes.svelte';
	import SessionExercises from 'coms/SessionExercises.svelte';
	import Button from 'coms/Button.svelte';
	import Fab from 'coms/Fab.svelte';
	import Label from 'coms/Label.svelte';
	import type { Interpreter } from 'xstate';

	export let token: string;
	export let exercises: Exercise[];
	export let title: string;

	const { state } = session;

	let form: HTMLFormElement;

	const onSave = () => {
		session.send({ type: 'SAVE', data: { token } });
	};

	const onNameInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		session.send({ type: 'TITLE_INPUT', data: { value: target.value } });
	};

	const onDateInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		session.send({ type: 'DATE_INPUT', data: { value: target.value } });
	};

	const onCancel = () => {
		session.send({ type: 'CANCEL', data: { token } });
	};

	const onNewExercise = () => {
		session.send({ type: 'NEW_EXERCISE' });
	};

	const focusInput: () => void = (node: HTMLInputElement) => {
		node.focus();
	};

	$: sessionData = $state.context.session;
	$: sessionModes = $state.children.modes;
	$: modes = sessionModes ? useService(sessionModes as Modes) : undefined;
</script>

<section class="space-y-100">
	{#if $state.matches('editing') && sessionData}
		<h1 class="mt-70 px-50 text-70 font-bold">{title}</h1>
		<form bind:this={form} on:submit|preventDefault={onSave} novalidate>
			<datalist id="exercises">
				{#each exercises as exercise (exercise.id)}
					<option value={exercise.name} data-id={exercise.id} />
				{/each}
			</datalist>
			{#if $state.matches('editing.session')}
				<Fab variant="outlined" label={ui.newExercise} on:click={onNewExercise} />
			{/if}
			<div class="flex flex-col space-y-110">
				<div class="flex flex-col space-y-70 px-50">
					<Label>
						<span>Name</span>
						<input
							use:focusInput
							type="text"
							name="title"
							value={sessionData.title}
							on:input={onNameInput} />
					</Label>
					<Label>
						<span>Date</span>
						<input
							type="date"
							name="date"
							value={sessionData.date}
							on:input={onDateInput} />
					</Label>
				</div>
				<SessionModes {modes} />
				<SessionExercises exercises={sessionData.exercises} {modes} />
				{#if $state.matches('editing.session')}
					<div class="flex flex-col space-y-70 px-50">
						<Button type="submit" theme="success">Save</Button>
						<Button theme="danger" on:click={onCancel}>Cancel</Button>
					</div>
				{/if}
			</div>
		</form>
	{/if}
</section>
