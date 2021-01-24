<script lang="ts">
	// Svelte
	import { setContext } from 'svelte';
	// Types
	import type { Exercise } from 'types';
	import type { SessionFormData, Modes } from 'src/machines/session';
	// xstate
	import type { UseServiceOutput } from 'src/lib/xstate-svelte';
	import { useService } from 'src/lib/xstate-svelte';
	// Stores
	import { session } from 'src/stores/session';
	// Utils
	import { focusInput, LoadUnit } from 'src/utils';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import SessionModes from 'coms/SessionModes.svelte';
	import SessionExercises from 'coms/SessionExercises.svelte';
	import Button from 'coms/Button.svelte';
	import Fab from 'coms/Fab.svelte';
	import Label from 'coms/Label.svelte';
	import RadioGroup from 'coms/RadioGroup.svelte';

	export let token: string;
	export let exercises: Exercise[];
	export let title: string;

	const modes: UseServiceOutput = useService($session.state.children.modes as Modes);

	setContext('modes', modes);

	let form: HTMLFormElement;
	$: sessionData = $session.state.context.session;

	const onSave = () => {
		const formData = Object.fromEntries(new FormData(form)) as SessionFormData;
		$session.send({ type: 'SAVE', data: { token, formData } });
	};

	const onCancel = () => {
		$session.send({ type: 'CANCEL', data: { token } });
	};

	const onNewExercise = () => {
		$session.send({ type: 'NEW_PERFORMANCE' });
	};
</script>

{#if $session.state.matches('editing') && sessionData}
	<h1 class="mt-70 px-50 text-70 font-bold">{title}</h1>
	<form bind:this={form} on:submit|preventDefault={onSave} novalidate>
		<datalist id="exercises">
			{#each exercises as exercise (exercise.id)}
				<option value={exercise.name} data-id={exercise.id} />
			{/each}
		</datalist>
		{#if $session.state.matches('editing.session') && !$modes.state.matches('enabled.reordering.dragging')}
			<Fab variant="outlined" label={ui.newExercise} on:click={onNewExercise} />
		{/if}
		<div class="flex flex-col space-y-110">
			<div class="flex flex-col space-y-70 px-50">
				<Label>
					<span>Name</span>
					<input use:focusInput type="text" name="title" value={sessionData.title} />
				</Label>
				<Label>
					<span>Date</span>
					<input type="date" name="date" value={sessionData.date.split('T')[0]} />
				</Label>
				<div class="grid grid-cols-2 gap-x-50">
					<Label>
						<span>Bodyweight</span>
						<input
							type="number"
							name="bodyweightAmount"
							min="0"
							step=".01"
							value={sessionData.bodyweightAmount}
						/>
					</Label>
					<RadioGroup
						name="bodyweightUnit"
						options={LoadUnit}
						selected={sessionData.bodyweightUnit || LoadUnit.lbs}
					/>
				</div>
			</div>
			<SessionModes />
			<SessionExercises performances={sessionData.performances} {token} />
			{#if $session.state.matches('editing.session')}
				<div class="flex flex-col space-y-70 px-50">
					<Button type="submit" theme="success">Save</Button>
					<Button theme="danger" on:click={onCancel}>Cancel</Button>
				</div>
			{/if}
		</div>
	</form>
{/if}
