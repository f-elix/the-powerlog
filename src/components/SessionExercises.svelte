<script lang="ts">
	// Svelte
	import { getContext } from 'svelte';
	// Types
	import type { ExerciseInstance } from 'types';
	// Stores
	import { session } from 'src/stores/session';
	// Components
	import ExerciseField from 'coms/ExerciseField.svelte';
	import ExerciseButton from 'coms/ExerciseButton.svelte';
	import HistoryModal from 'coms/HistoryModal.svelte';

	export let exercises: ExerciseInstance[];
	export let token: string;

	const modes: any = getContext('modes');

	const sessionState = session.state;
	const modesState = modes.state;

	$: editedExercise = $sessionState.children.exercise;
	$: editedId = $sessionState.context.editedId;
	$: historySession = $modesState.context.history;

	const supersetIds: (number | undefined)[] = [
		...new Set(exercises.map((ex) => ex.supersetId).filter(Boolean))
	];

	const supersetClass = (supersetId: number | undefined): string => {
		if (!supersetId) {
			return '';
		}
		const index = supersetIds.indexOf(supersetId);
		if (index % 2 === 0) {
			return '_superset-even';
		}
		return '_superset-odd';
	};

	const onHistoryDismiss = () => {
		modes.send({ type: 'DISMISS' });
	};

	const onMove = (e: PointerEvent | TouchEvent) => {
		const { pageY: y } = e instanceof TouchEvent ? e.touches[0] : e;
		modes.send({ type: 'MOVE', data: { y } });
	};

	const onDrop = () => {
		modes.send({ type: 'DROP' });
	};
</script>

<svelte:body
	on:pointerup={onDrop}
	on:touchend={onDrop}
	on:pointermove={onMove}
	on:touchmove={onMove} />

<div class="flex flex-col">
	{#if $modesState.matches('enabled.history.loaded')}
		<HistoryModal session={historySession} on:done={onHistoryDismiss} />
	{/if}
	{#if exercises}
		{#each exercises as instance, i (instance.id)}
			{#if $sessionState.matches('editing.exercise.editing') && instance.id === editedId}
				<ExerciseField service={editedExercise} />
			{:else}
				<ExerciseButton
					{instance}
					index={i}
					{token}
					supersetClass={supersetClass(instance.supersetId)}
				/>
			{/if}
		{/each}
	{/if}
	{#if $sessionState.matches('editing.exercise.creating')}
		<ExerciseField service={editedExercise} />
	{/if}
</div>
