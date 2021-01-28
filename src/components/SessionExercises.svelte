<script lang="ts">
	// Types
	import type { Performance } from 'types';
	import type { UseServiceOutput } from 'src/lib/xstate-svelte';
	import { ListTypes } from 'src/machines/modes';
	// Svelte
	import { afterUpdate, getContext } from 'svelte';
	// Stores
	import { session } from 'src/stores/session';
	// Components
	import ExerciseField from 'coms/ExerciseField.svelte';
	import ExerciseButton from 'coms/ExerciseButton.svelte';
	import HistoryModal from 'coms/HistoryModal.svelte';

	export let performances: Performance[] = [];

	const modes: UseServiceOutput = getContext('modes');

	let performanceEls: HTMLElement[] = [];
	$: editedExercise = $session.state.children.exercise;
	$: editedId = $session.state.context.editedId;
	$: draggedId = $modes.state.context.draggedId;
	$: listType = $modes.state.context.listType;
	$: historySession = $modes.state.context.history;

	afterUpdate(() => {
		if (listType === ListTypes.perf) {
			$modes.send({ type: 'LIST_REORDERED', data: { listEls: performanceEls } });
		}
	});

	const onHistoryDismiss = () => {
		$modes.send({ type: 'DISMISS' });
	};

	const addDragListeners = () => {
		document.addEventListener('pointermove', onMove);
		document.addEventListener('touchmove', onMove);
		document.addEventListener('pointerup', onDrop);
		document.addEventListener('touchend', onDrop);
	};

	const removeDragListeners = () => {
		document.removeEventListener('pointermove', onMove);
		document.removeEventListener('touchmove', onMove);
		document.removeEventListener('pointerup', onDrop);
		document.removeEventListener('touchend', onDrop);
	};

	const onDragPerformance = (e: CustomEvent, id: number, index: number) => {
		const event: PointerEvent | TouchEvent = e.detail;
		const { clientY: y } = event instanceof TouchEvent ? event.touches[0] : event;
		$modes.send({
			type: 'DRAG',
			data: { index, y, id, listEls: performanceEls, listType: ListTypes.perf }
		});
		addDragListeners();
	};

	const onMove = (e: PointerEvent | TouchEvent) => {
		if (!$modes.state.matches('enabled.reordering.dragging')) {
			return;
		}
		const { clientY: y } = e instanceof TouchEvent ? e.touches[0] : e;
		$modes.send({ type: 'MOVE', data: { y } });
	};

	const onDrop = () => {
		$modes.send({ type: 'DROP' });
		removeDragListeners();
	};
</script>

<div class="flex flex-col">
	{#if $modes.state.matches('enabled.history.fetching') || $modes.state.matches('enabled.history.loaded')}
		<HistoryModal session={historySession} on:done={onHistoryDismiss} />
	{/if}

	{#each performances as performance, i}
		{#if $session.state.matches('editing.exercise.editing') && performance.id === editedId}
			<ExerciseField service={editedExercise} />
		{:else}
			<div
				data-id={performance.id}
				class="relative flex bg-fg-light odd:bg-fg transition-all duration-500 ease-out-expo"
				class:_disabled={$session.state.matches('editing.exercise')}
				class:_dragging={$modes.state.matches('enabled.reordering.dragging') &&
					listType === ListTypes.perf &&
					performance.id === draggedId}
				style="--y: {$modes.state.matches('enabled.reordering.dragging') &&
				listType === ListTypes.perf &&
				performance.id === draggedId
					? $modes.state.context.y
					: 0}px"
				bind:this={performanceEls[i]}
			>
				<ExerciseButton
					{performance}
					index={i}
					on:drag={addDragListeners}
					on:performancedrag={(e) => onDragPerformance(e, performance.id, i)}
				/>
			</div>
		{/if}
	{/each}
	{#if $session.state.matches('editing.exercise.creating')}
		<ExerciseField service={editedExercise} />
	{/if}
</div>

<style>
	._disabled {
		@apply opacity-25;
	}

	._disabled :global(button) {
		cursor: default;
	}

	._dragging {
		@apply relative z-50 bg-info-light;
		box-shadow: 0 0 12px 3px rgba(0, 0, 0, 0.4);
		transform: translate3d(0, var(--y), 0);
		transition: none;
	}

	._dragging :global(*) {
		cursor: grabbing;
	}

	._superset-even {
		@apply border-solid border-success border-l-30 bg-fg-light;
	}

	._superset-odd {
		@apply border-solid border-info border-l-30 bg-fg;
	}
</style>
