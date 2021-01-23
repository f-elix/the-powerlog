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
	export let token: string;

	const modes: UseServiceOutput = getContext('modes');

	let listEls: HTMLElement[] = [];
	$: editedExercise = $session.state.children.exercise;
	$: editedId = $session.state.context.editedId;
	$: draggedId = $modes.state.context.draggedId;
	$: listType = $modes.state.context.listType;
	$: historySession = $modes.state.context.history;

	afterUpdate(() => {
		if (!$modes.state.matches('enabled.reordering.dragging')) {
			return;
		}
		$modes.send({ type: 'LIST_REORDERED', data: { listEls } });
	});

	const onHistoryDismiss = () => {
		$modes.send({ type: 'DISMISS' });
	};

	const onDragPerformance = (e: CustomEvent, id: number, index: number) => {
		const event: PointerEvent | TouchEvent = e.detail;
		const { clientY: y } = event instanceof TouchEvent ? event.touches[0] : event;
		$modes.send({ type: 'DRAG', data: { index, y, id, listEls, listType: ListTypes.perf } });
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
	};
</script>

<svelte:body
	on:pointerup={onDrop}
	on:touchend={onDrop}
	on:pointermove={onMove}
	on:touchmove={onMove} />

<div class="flex flex-col">
	{#if $modes.state.matches('enabled.history.loaded')}
		<HistoryModal session={historySession} on:done={onHistoryDismiss} />
	{/if}

	{#each performances as performance, i}
		{#if $session.state.matches('editing.exercise.editing') && performance.id === editedId}
			<ExerciseField service={editedExercise} />
		{:else}
			<div
				data-id={performance.id}
				class="relative flex bg-fg-light odd:bg-fg transition-all duration-500 ease-out-expo"
				class:_disabled={$session.state.matches('editing.exercise.editing')}
				class:_dragging={$modes.state.matches('enabled.reordering.dragging') &&
					listType === ListTypes.perf &&
					performance.id === draggedId}
				style="--y: {$modes.state.matches('enabled.reordering.dragging') &&
				listType === ListTypes.perf &&
				performance.id === draggedId
					? $modes.state.context.y
					: 0}px"
				bind:this={listEls[i]}
			>
				<ExerciseButton
					{performance}
					index={i}
					{token}
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
		opacity: 0.25;
	}

	:global(._disabled button) {
		cursor: default;
	}

	._dragging {
		@apply relative z-50 bg-info-light;
		box-shadow: 0 0 12px 3px rgba(0, 0, 0, 0.4);
		transform: translate3d(0, var(--y), 0);
		transition: none;
	}

	:global(._dragging *) {
		cursor: grabbing;
	}

	._superset-even {
		@apply border-solid border-success border-l-30 bg-fg-light;
	}

	._superset-odd {
		@apply border-solid border-info border-l-30 bg-fg;
	}
</style>
