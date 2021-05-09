<script lang="ts">
	// Types
	import type { Performance } from 'types';
	import type { Modes } from 'src/machines/session';
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

	const { state: sessionState } = session;

	const modes: Modes = getContext('modes');

	let performanceEls: HTMLElement[] = [];
	$: editedExercise = $sessionState.children.exercise;
	$: editedId = $sessionState.context.editedId;
	$: draggedId = $modes.context.draggedId;
	$: listType = $modes.context.listType;
	$: historySession = $modes.context.history;

	afterUpdate(() => {
		if (listType === ListTypes.perf) {
			modes.send({ type: 'LIST_REORDERED', data: { listEls: performanceEls } });
		}
	});

	const onHistoryDismiss = () => {
		modes.send({ type: 'DISMISS' });
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
		modes.send({
			type: 'DRAG',
			data: { index, y, id, listEls: performanceEls, listType: ListTypes.perf }
		});
		addDragListeners();
	};

	const onMove = (e: PointerEvent | TouchEvent) => {
		if (!$modes.matches('enabled.reordering.dragging')) {
			return;
		}
		const { clientY: y } = e instanceof TouchEvent ? e.touches[0] : e;
		modes.send({ type: 'MOVE', data: { y } });
	};

	const onDrop = () => {
		modes.send({ type: 'DROP' });
		removeDragListeners();
	};
</script>

<div class="flex flex-col">
	{#if $modes.matches('enabled.history.fetching') || $modes.matches('enabled.history.loaded')}
		<HistoryModal session={historySession} on:done={onHistoryDismiss} />
	{/if}
	<div class="flex flex-col">
		{#each performances as performance, i}
			{#if $sessionState.matches('editing.exercise.editing') && performance.id === editedId}
				<ExerciseField service={editedExercise} />
			{:else}
				<div
					data-id={performance.id}
					class="relative flex bg-fg-light odd:bg-fg transition-all duration-500 ease-out-expo"
					class:_disabled={$sessionState.matches('editing.exercise')}
					class:_dragging={$modes.matches('enabled.reordering.dragging') &&
						listType === ListTypes.perf &&
						performance.id === draggedId}
					style="--y: {$modes.matches('enabled.reordering.dragging') &&
					listType === ListTypes.perf &&
					performance.id === draggedId
						? $modes.context.y
						: 0}px"
					bind:this={performanceEls[i]}
				>
					<ExerciseButton
						{performance}
						on:drag={addDragListeners}
						on:performancedrag={(e) => onDragPerformance(e, performance.id, i)}
					/>
				</div>
			{/if}
		{/each}
		{#if $sessionState.matches('editing.exercise.creating')}
			<ExerciseField service={editedExercise} />
		{/if}
	</div>
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
