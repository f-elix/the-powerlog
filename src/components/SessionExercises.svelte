<script lang="ts">
	// Types
	import type { Exercise, ExerciseInstance } from 'types';
	// Stores
	import { session } from 'src/stores/session';
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
	$: editedId = $sessionState.context.editedId;
	$: draggedId = $modesState.context.draggedId;
	$: historySession = $modesState.context.history;

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

	const onHistoryDismiss = () => {
		modes.send({ type: 'DISMISS' });
	};

	const onDrag = (e: PointerEvent | TouchEvent, index: number, id: number) => {
		const { pageY: y } = e instanceof TouchEvent ? e.touches[0] : e;
		modes.send({ type: 'DRAG', data: { index, y, id, exerciseEls } });
	};

	const onMove = (e: PointerEvent | TouchEvent) => {
		if (!$modesState.matches('enabled.reordering.dragging')) {
			return;
		}
		const { pageY: y } = e instanceof TouchEvent ? e.touches[0] : e;
		modes.send({ type: 'MOVE', data: { y } });
	};

	const onDrop = () => {
		modes.send({ type: 'DROP' });
	};

	const groupBySupersetId = (
		data: ExerciseInstance[]
	): Array<ExerciseInstance | Array<ExerciseInstance>> => {
		const supersets: {
			[key: number]: {
				index: number;
				instances: ExerciseInstance[];
			};
		} = {};

		const computedInstances: Array<ExerciseInstance | Array<ExerciseInstance>> = data;

		data.forEach((instance, i) => {
			const { supersetId } = instance;
			if (!supersetId) {
				return;
			}
			if (supersets[supersetId]) {
				supersets[supersetId].instances.push(instance);
			} else {
				supersets[supersetId] = { index: i, instances: [instance] };
			}
		});

		Object.values(supersets).forEach((superset) => {
			computedInstances.splice(superset.index, superset.instances.length, superset.instances);
		});

		return computedInstances;
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
		{#each groupBySupersetId(exercises) as instance, i}
			{#if $sessionState.matches('editing.exercise.editing') && instance.id === editedId}
				<ExerciseField service={editedExercise} />
			{:else}
				<div
					data-id={instance.id}
					class="relative flex bg-fg-light odd:bg-fg transition-all duration-500 ease-out-expo"
					class:_disabled={$sessionState.matches('editing.exercise.editing') &&
						instance.id !== editedId}
					class:_dragging={$modesState.matches('enabled.reordering.dragging') &&
						instance.id === draggedId}
					style="--y: {$modesState.matches('enabled.reordering.dragging') &&
					instance.id === draggedId
						? $modesState.context.y
						: 0}px"
					bind:this={exerciseEls[i]}
				>
					{#if Array.isArray(instance)}
						<button
							class="w-full"
							type="button"
							on:click={() => onEditExercise(instance[0].id)}>
							<div class="flex flex-col">
								{#each instance as supersetInstance, i}
									<span class="flex items-center px-50"
										>{i + 1})<ExerciseData instance={supersetInstance} /></span
									>
								{/each}
							</div>
						</button>
					{:else}
						<button
							class="w-full"
							type="button"
							on:click={() => onEditExercise(instance.id)}>
							<ExerciseData {instance} />
						</button>
					{/if}
					{#if $modesState.matches('enabled.reordering')}
						<button
							type="button"
							class="absolute top-0 right-0 h-full w-140 {i % 2 === 0
								? 'bg-info-light'
								: 'bg-info-lighter'} cursor-grab"
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
							class="absolute top-0 right-0 h-full w-140 {i % 2 === 0
								? 'bg-highlight'
								: 'bg-highlight-light'}"
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
							class="absolute top-0 right-0 h-full w-140 {i % 2 === 0
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
			{/if}
		{/each}
	{/if}
	{#if $sessionState.matches('editing.exercise.creating')}
		<ExerciseField service={editedExercise} />
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
</style>
