<script lang="ts">
	// Types
	import type { Performance } from 'types';
	import type { UseServiceOutput } from 'src/lib/xstate-svelte';
	// Svelte
	import { getContext } from 'svelte';
	// Stores
	import { session } from 'src/stores/session';
	// Components
	import ExerciseField from 'coms/ExerciseField.svelte';
	import ExerciseButton from 'coms/ExerciseButton.svelte';
	import HistoryModal from 'coms/HistoryModal.svelte';
	import Reorder from 'coms/svg/Reorder.svelte';

	export let performances: Performance[] = [];
	export let token: string;

	const modes: UseServiceOutput = getContext('modes');

	let exerciseEls: HTMLElement[] = [];

	$: editedExercise = $session.state.children.exercise;
	$: editedId = $session.state.context.editedId;
	$: draggedId = $modes.state.context.draggedId;
	$: historySession = $modes.state.context.history;

	const onHistoryDismiss = () => {
		$modes.send({ type: 'DISMISS' });
	};

	const onDrag = (e: PointerEvent | TouchEvent, id: number, index: number) => {
		const { pageY: y } = e instanceof TouchEvent ? e.touches[0] : e;
		$modes.send({ type: 'DRAG', data: { index, y, id, exerciseEls } });
	};

	const onMove = (e: PointerEvent | TouchEvent) => {
		const { pageY: y } = e instanceof TouchEvent ? e.touches[0] : e;
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
					performance.id === draggedId}
				style="--y: {$modes.state.matches('enabled.reordering.dragging') &&
				performance.id === draggedId
					? $modes.state.context.y
					: 0}px"
				bind:this={exerciseEls[i]}
			>
				<ExerciseButton {performance} index={i} {token} />
				{#if $modes.state.matches('enabled.reordering')}
					<button
						type="button"
						class="absolute top-0 right-0 h-full w-140 {i % 2 === 0
							? 'bg-info-light'
							: 'bg-info-lighter'} cursor-grab"
						aria-label="Drag handle"
						on:pointerdown={(e) => onDrag(e, performance.id, i)}
						on:touchstart|preventDefault={() => {}}>
						<div class="flex items-center justify-center">
							<Reorder extClass="w-80 h-80" />
						</div>
					</button>
				{/if}
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
		@apply relative z-50 shadow-xl;
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
