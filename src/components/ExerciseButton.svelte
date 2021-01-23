<script lang="ts">
	// Types
	import type { UseServiceOutput } from 'src/lib/xstate-svelte';
	import type { ExerciseInstance, Performance } from 'types';
	import { ListTypes } from 'src/machines/modes';
	// Svelte
	import { createEventDispatcher, getContext, afterUpdate } from 'svelte';
	// Stores
	import { session } from 'src/stores/session';
	// Components
	import ExerciseData from 'coms/ExerciseData.svelte';
	import Reorder from 'coms/svg/Reorder.svelte';
	import History from 'coms/svg/History.svelte';
	import Delete from 'coms/svg/Delete.svelte';

	export let performance: Performance;
	export let token: string;
	export let index: number;

	const dispatch = createEventDispatcher();

	const modes: UseServiceOutput = getContext('modes');

	let instancesEls: HTMLElement[] = [];
	let instances: ExerciseInstance[];
	$: instances = performance.exerciseInstances;
	$: draggedId = $modes.state.context.draggedId;
	$: listType = $modes.state.context.listType;
	$: draggedInstancePerformanceId = $modes.state.context.draggedInstancePerformanceId;

	afterUpdate(() => {
		if (listType === ListTypes.inst && performance.id === draggedInstancePerformanceId) {
			$modes.send({ type: 'LIST_REORDERED', data: { listEls: instancesEls } });
		}
	});

	const onEditPerformance = () => {
		$session.send({ type: 'EDIT_PERFORMANCE', data: { performanceId: performance.id } });
	};

	const onDragPerformance = (e: MouseEvent | TouchEvent) => {
		dispatch('performancedrag', e);
	};

	const onDragInstance = (
		e: MouseEvent | TouchEvent,
		instanceId: number,
		instanceIndex: number
	) => {
		const { clientY: y } = e instanceof TouchEvent ? e.touches[0] : e;
		$modes.send({
			type: 'DRAG',
			data: {
				index: instanceIndex,
				y,
				id: instanceId,
				listEls: instancesEls,
				listType: ListTypes.inst,
				performanceId: performance.id
			}
		});
	};

	const onDeletePerformance = (instanceId: number) => {
		$modes.send({
			type: 'DELETE_EXERCISE',
			data: { performanceId: performance.id, instanceId }
		});
	};

	const onGetExerciseHistory = (exerciseId?: number) => {
		if (!exerciseId) {
			return;
		}
		$modes.send({
			type: 'EXERCISE_HISTORY',
			data: { exerciseId, token, date: $session.state.context.session?.date }
		});
	};
</script>

<div class="flex w-full">
	<div class="flex flex-col w-full">
		{#each instances as instance, i}
			<div
				data-id={instance.id}
				class="flex w-full transition-all duration-500 ease-out-expo"
				class:_dragging={$modes.state.matches('enabled.reordering.dragging') &&
					listType === ListTypes.inst &&
					draggedId === instance.id}
				style="--y: {$modes.state.matches('enabled.reordering.dragging') &&
				listType === ListTypes.inst &&
				instance.id === draggedId
					? $modes.state.context.y
					: 0}px"
				bind:this={instancesEls[i]}
			>
				<button class="w-full" type="button" on:click={onEditPerformance}>
					<ExerciseData
						{instance}
						isSuperset={instances.length > 1}
						exerciseNum={i + 1}
					/>
				</button>
				{#if instances.length > 1 && $modes.state.matches('enabled.reordering')}
					<button
						type="button"
						class="w-140 cursor-grab"
						aria-label="Drag handle"
						on:pointerdown={(e) => onDragInstance(e, instance.id, i)}
						on:touchstart|preventDefault={() => {}}>
						<div class="flex items-center justify-center">
							<Reorder extClass="w-60 h-60" />
						</div>
					</button>
				{/if}
				{#if $modes.state.matches('enabled.history') && instance.exercise?.id}
					<button
						type="button"
						class="w-140 "
						aria-label="Exercise history"
						on:click={() => onGetExerciseHistory(instance.exercise?.id)}>
						<div class="flex items-center justify-center">
							<History extClass="w-80 h-80 text-highlight-lighter" />
						</div>
					</button>
				{/if}
				{#if $modes.state.matches('enabled.deleting')}
					<button
						type="button"
						class="w-140"
						aria-label="Delete exercise"
						on:click={() => onDeletePerformance(instance.id)}>
						<div class="flex items-center justify-center">
							<Delete extClass="w-80 h-80 text-danger-light" />
						</div>
					</button>
				{/if}
			</div>
		{/each}
	</div>
	{#if $modes.state.matches('enabled.reordering')}
		<button
			type="button"
			class="h-full w-1/4 cursor-grab"
			aria-label="Drag handle"
			on:pointerdown={onDragPerformance}
			on:touchstart|preventDefault={() => {}}>
			<div class="flex items-center justify-center">
				<Reorder extClass="w-80 h-80" />
			</div>
		</button>
	{/if}
</div>

<style>
	._dragging {
		@apply relative z-50 bg-fg-lighter;
		box-shadow: 0 0 12px 3px rgba(0, 0, 0, 0.4);
		transform: translate3d(0, var(--y), 0);
		transition: none;
	}
</style>
