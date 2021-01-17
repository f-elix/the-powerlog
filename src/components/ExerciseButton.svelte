<script lang="ts">
	// Svelte
	import { getContext } from 'svelte';
	// Types
	import type { ExerciseInstance } from 'types';
	// Stores
	import { session } from 'src/stores/session';
	// Components
	import ExerciseData from 'coms/ExerciseData.svelte';
	import Reorder from 'coms/svg/Reorder.svelte';
	import History from 'coms/svg/History.svelte';
	import Delete from 'coms/svg/Delete.svelte';

	export let instance: ExerciseInstance;
	export let token: string;
	export let index: number;
	export let supersetClass: string;

	const modes: any = getContext('modes');
	const modesState = modes.state;
	const sessionState = session.state;

	let exerciseEls: HTMLElement[] = [];

	$: draggedId = $modesState.context.draggedId;

	const onEditExercise = (instanceId: number) => {
		session.send({ type: 'EDIT_EXERCISE', data: { instanceId } });
	};

	const onDeleteExercise = (instanceId: number) => {
		modes.send({ type: 'DELETE_EXERCISE', data: { instanceId } });
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

	const onDrag = (e: PointerEvent | TouchEvent, index: number, id: number) => {
		const { pageY: y } = e instanceof TouchEvent ? e.touches[0] : e;
		modes.send({ type: 'DRAG', data: { index, y, id, exerciseEls } });
	};
</script>

<div
	data-id={instance.id}
	class="relative flex bg-fg-light odd:bg-fg transition-all duration-500 ease-out-expo {supersetClass}"
	class:_disabled={$sessionState.matches('editing.exercise.editing')}
	class:_dragging={$modesState.matches('enabled.reordering.dragging') &&
		instance.id === draggedId}
	style="--y: {$modesState.matches('enabled.reordering.dragging') && instance.id === draggedId
		? $modesState.context.y
		: 0}px"
	bind:this={exerciseEls[index]}
>
	<button class="w-full" type="button" on:click={() => onEditExercise(instance.id)}>
		<ExerciseData {instance} />
	</button>
	{#if $modesState.matches('enabled.history') && instance.exercise?.id}
		<button
			type="button"
			class="absolute top-0 right-0 h-full w-140 {index % 2 === 0
				? 'bg-highlight'
				: 'bg-highlight-light'}"
			aria-label="Exercise history"
			on:click={() => onGetExerciseHistory(instance.exercise?.id)}>
			<div class="flex items-center justify-center">
				<History extClass="w-80 h-80" />
			</div>
		</button>
	{/if}
	{#if $modesState.matches('enabled.reordering')}
		<button
			type="button"
			class="absolute top-0 right-0 h-full w-140 {index % 2 === 0
				? 'bg-info-light'
				: 'bg-info-lighter'} cursor-grab"
			aria-label="Drag handle"
			on:pointerdown={(e) => onDrag(e, index, instance.id)}
			on:touchstart|preventDefault={() => {}}>
			<div class="flex items-center justify-center">
				<Reorder extClass="w-80 h-80" />
			</div>
		</button>
	{/if}

	{#if $modesState.matches('enabled.deleting')}
		<button
			type="button"
			class="absolute top-0 right-0 h-full w-140 {index % 2 === 0
				? 'bg-danger-medium'
				: 'bg-danger-light'}"
			aria-label="Delete exercise"
			on:click={() => onDeleteExercise(instance.id)}>
			<div class="flex items-center justify-center">
				<Delete extClass="w-80 h-80" />
			</div>
		</button>
	{/if}
</div>

<style>
	._disabled {
		opacity: 0.25;
	}

	._disabled button {
		cursor: default;
	}

	._dragging {
		@apply relative z-50 shadow-xl;
		transform: translate3d(0, var(--y), 0);
		transition: none;
	}

	._dragging * {
		cursor: grabbing;
	}

	._superset-even {
		@apply border-solid border-success border-l-30;
	}

	._superset-odd {
		@apply border-solid border-info border-l-30;
	}
</style>
