<script lang="ts">
	// Types
	import type { Interpreter } from 'xstate';
	import { SetType, TimeUnit, LoadUnit } from 'src/utils';
	import type { Exercise } from 'types';
	import type { ExerciseContext, ExerciseEvent, ExerciseState } from 'src/machines/exercise';
	// xstate-svelte
	import { useService } from 'xstate-svelte';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import Label from 'coms/Label.svelte';
	import RadioGroup from 'coms/RadioGroup.svelte';
	import Checkbox from 'coms/Checkbox.svelte';
	import Plus from 'coms/svg/Plus.svelte';
	import Close from 'coms/svg/Close.svelte';
	import { onMount } from 'svelte';

	export let service: Interpreter<ExerciseContext, any, ExerciseEvent, ExerciseState>;

	const { state, send } = useService(service);

	let exerciseInput: HTMLInputElement;
	onMount(() => {
		exerciseInput.focus();
	});

	$: instance = $state.context.instance;
	$: executions = instance.executions;

	const onExerciseInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const name: string = target.value;
		if (!name) {
			return;
		}
		const list = target.list as HTMLDataListElement;
		const option = Array.from(list.options).find(
			(option: HTMLOptionElement) => option.value === name
		);
		const id = parseInt(option?.dataset.id || '0', 10);
		const exercise: Exercise = {
			name,
			userId: ''
		};
		if (id) {
			exercise.id = id;
		}
		send({ type: 'EXERCISE_INPUT', data: { exercise } });
	};

	const onNewExecution = () => {
		send({ type: 'NEW_EXECUTION' });
	};

	const onExecInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const path = target.dataset.key || '';
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const parent = target.closest('[data-id]') as HTMLDivElement;
		const id = parseInt(parent.dataset.id || '0', 10);
		send({ type: 'EXECUTION_INPUT', data: { path, value, executionId: id } });
	};

	const onDeleteExec = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const parent = target.closest('[data-id]') as HTMLDivElement;
		const id = parseInt(parent.dataset.id || '0', 10);
		send({ type: 'DELETE_EXECUTION', data: { executionId: id } });
	};

	const onCancel = () => {
		send({ type: 'CANCEL' });
	};

	const onSave = () => {
		send({ type: 'SAVE' });
	};
</script>

<fieldset>
	<div class="space-y-80 p-50 bg-fg">
		<Label>
			<span>Exercise</span>
			<input
				type="text"
				name="exercise"
				list="exercises"
				on:input={onExerciseInput}
				bind:this={exerciseInput} />
		</Label>
		{#if $state.matches('error')}<small class="text-danger">{ui.exerciseRequired}</small>{/if}
		{#each executions as execution, i (execution.id)}
			<div class="flex flex-col items-center space-y-50" data-id={execution.id}>
				<div
					class="flex flex-col flex-grow space-y-50 px-30 py-50 border-solid border-main border-20 rounded-10 shadow-lg">
					{#if executions.length > 1}
						<button class="self-end text-danger" on:click={onDeleteExec}>
							<Close />
						</button>
					{/if}
					<div class="grid grid-cols-4 gap-x-50">
						<Label>
							<span>Sets</span>
							<input
								type="number"
								name="sets-{execution.id}"
								value={execution.sets}
								data-key="sets"
								on:input={onExecInput} />
						</Label>
						{#if execution.setType === SetType.time}
							<Label>
								<span>Time</span>
								<input
									type="number"
									name="time-{execution.id}"
									value={execution.duration.amount}
									data-key="duration.amount"
									on:input={onExecInput} />
							</Label>
						{:else}
							<Label>
								<span>Reps</span>
								<input
									type="number"
									name="reps-{execution.id}"
									value={execution.reps}
									data-key="reps"
									on:input={onExecInput} />
							</Label>
						{/if}
						<RadioGroup
							name="setType-{execution.id}"
							options={SetType}
							selected={execution.setType}
							key="setType"
							on:change={onExecInput} />
						<RadioGroup
							name="timeUnit-{execution.id}"
							options={TimeUnit}
							selected={execution.duration.unit}
							key="duration.unit"
							disabled={execution.setType === SetType.reps}
							on:change={onExecInput} />
					</div>
					<div class="grid grid-cols-4 gap-x-50">
						<Label extClass="col-span-1">
							<span>Weight</span>
							<input
								type="number"
								name="load"
								value={execution.load?.amount}
								data-key="load.amount"
								on:input={onExecInput} />
						</Label>
						<RadioGroup
							name="loadUnit-{execution.id}"
							options={LoadUnit}
							selected={execution.load.unit}
							key="load.unit"
							on:change={onExecInput} />
						<Checkbox
							extClass="col-span-2"
							label="Add Bodyweight"
							name="bodyweight-{execution.id}"
							key="load.bodyweight"
							checked={execution.load?.bodyweight}
							on:change={onExecInput} />
					</div>
				</div>
				{#if i + 1 === executions.length}
					<button
						class="p-30 border-20 border-action border-solid rounded-10 shadow-md transition-colors pointer:hover:bg-action active:bg-action _focus-default"
						aria-label="Add sets"
						on:click={onNewExecution}>
						<Plus extClass="w-60 h-60" />
					</button>
				{/if}
			</div>
		{/each}
		<div class="flex flex-col items-end">
			<div class="flex items-center space-x-50">
				<button
					class="p-40 rounded-10 bg-danger shadow-md transition-colors pointer:hover:bg-opacity-50 active:bg-opacity-50 _focus-default"
					aria-label="Cancel"
					on:click={onCancel}>
					<Close />
				</button>
				<button
					class="p-40 rounded-10 bg-action shadow-md transition-colors pointer:hover:bg-opacity-50 active:bg-opacity-50 _focus-default"
					aria-label="Confirm"
					on:click={onSave}>
					<svg
						width="22"
						height="17"
						viewBox="0 0 22 17"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M7.23334 16.0654L0.369341 9.20141C-0.0430355 8.78904 -0.0430355 8.12042 0.369341 7.708L1.86271 6.21459C2.27509 5.80217 2.94375 5.80217 3.35613 6.21459L7.98005 10.8385L17.884 0.934587C18.2963 0.522211 18.965 0.522211 19.3774 0.934587L20.8708 2.428C21.2831 2.84038 21.2831 3.509 20.8708 3.92142L8.72676 16.0655C8.31434 16.4778 7.64572 16.4778 7.23334 16.0654Z"
							fill="currentColor" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</fieldset>
