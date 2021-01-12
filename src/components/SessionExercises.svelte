<script lang="ts">
	// Types
	import type { ExerciseInstance } from 'types';
	// Stores
	import { session } from 'src/stores/session';
	// Utils
	import { getElMidPoint } from 'src/utils';
	// Components
	import ExerciseData from 'coms/ExerciseData.svelte';
	import ExerciseField from 'coms/ExerciseField.svelte';
	import HistoryModal from 'coms/HistoryModal.svelte';
	import Reorder from 'coms/svg/Reorder.svelte';
	import History from 'coms/svg/History.svelte';
	import Delete from 'coms/svg/Delete.svelte';

	export let exercises: ExerciseInstance[];
	export let modes: any;
	export let token: string;

	const sessionState = session.state;
	const modesState = modes.state;

	let exerciseEls: HTMLElement[] = [];

	$: editedExercise = $sessionState.children.exercise;
	$: editedIndex = $sessionState.context.editedIndex;
	$: draggedIndex = $modesState.context.draggedIndex;
	$: draggedId = $modesState.context.draggedId;
	$: historySession = $modesState.context.history;

	const onEditExercise = (index: number) => {
		session.send({ type: 'EDIT_EXERCISE', data: { instanceIndex: index } });
	};

	const onDeleteExercise = (index: number) => {
		modes.send({ type: 'DELETE_EXERCISE', data: { instanceIndex: index } });
	};

	const onGetExerciseHistory = (exerciseId?: number) => {
		if (!exerciseId) {
			return;
		}
		modes.send({
			type: 'EXERCISE_HISTORY',
			data: { exerciseId, token, date: $sessionState.context.session?.date }
		});
	};

	const onHistoryDismiss = () => {
		modes.send({ type: 'DISMISS' });
	};

	const onDrag = (e: PointerEvent | TouchEvent, index: number, id: number) => {
		const { clientY: y } = e instanceof TouchEvent ? e.touches[0] : e;
		modes.send({ type: 'DRAG', data: { index, y, id, exerciseEls } });
	};

	const onMove = (e: PointerEvent | TouchEvent) => {
		if (!$modesState.matches('enabled.reordering.dragging')) {
			return;
		}
		const { clientY: y } = e instanceof TouchEvent ? e.touches[0] : e;
		modes.send({ type: 'MOVE', data: { y } });
	};

	const onDrop = () => {
		modes.send({ type: 'DROP' });
	};
</script>

<style>
	._disabled {
		opacity: 0.25;
	}

	._disabled button {
		cursor: default;
	}

	._dragging {
		@apply relative z-50 shadow-xl;
		transform: translateY(var(--y));
		transition: none;
	}

	._dragging * {
		cursor: grabbing;
	}
</style>

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
		{#each exercises as instance, i}
			{#if $sessionState.matches('editing.exercise.editing') && i === editedIndex}
				<ExerciseField service={editedExercise} />
			{:else}
				<div
					class="relative flex bg-fg-light odd:bg-fg transition-all duration-500 ease-out-expo"
					class:_disabled={$sessionState.matches('editing.exercise.editing') && i !== editedIndex}
					class:_dragging={$modesState.matches('enabled.reordering.dragging') && instance.id === draggedId}
					style="--y: {$modesState.matches('enabled.reordering.dragging') && instance.id === draggedId ? $modesState.context.y : 0}px"
					bind:this={exerciseEls[i]}>
					<button class="w-full" type="button" on:click={() => onEditExercise(i)}>
						<ExerciseData {instance} />
					</button>
					{#if $modesState.matches('enabled.reordering')}
						<button
							type="button"
							class="absolute top-0 right-0 h-full w-140 {i % 2 === 0 ? 'bg-info-light' : 'bg-info-lighter'} cursor-grab"
							aria-label="Drag handle"
							on:pointerdown={(e) => onDrag(e, i, instance.id)}
							on:touchstart|preventDefault={() => {}}>
							<div class="flex items-center justify-center">
								<Reorder extClass="w-80 h-80" />
							</div>
						</button>
					{/if}
					{#if $modesState.matches('enabled.history') && instance.exercise?.id}
						<button
							type="button"
							class="absolute top-0 right-0 h-full w-140 {i % 2 === 0 ? 'bg-highlight' : 'bg-highlight-light'}"
							aria-label="Exercise history"
							on:click={() => onGetExerciseHistory(instance.exercise?.id)}>
							<div class="flex items-center justify-center">
								<History extClass="w-80 h-80" />
							</div>
						</button>
					{/if}
					{#if $modesState.matches('enabled.deleting')}
						<button
							type="button"
							class="absolute top-0 right-0 h-full w-140 {i % 2 === 0 ? 'bg-danger-medium' : 'bg-danger-light'}"
							aria-label="Delete exercise"
							on:click={() => onDeleteExercise(i)}>
							<div class="flex items-center justify-center">
								<Delete extClass="w-80 h-80" />
							</div>
						</button>
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
	{#if $sessionState.matches('editing.exercise.creating')}
		<ExerciseField service={editedExercise} />
	{/if}
</div>
