<script lang="ts">
	// Types
	import type { Interpreter } from 'xstate';
	import { SetType, TimeUnit, LoadUnit, scrollIntoView } from 'src/utils';
	import type { ExerciseContext, ExerciseEvent, ExerciseState } from 'src/machines/exercise';
	// xstate-svelte
	import { useService } from 'src/lib/xstate-svelte';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import Label from 'coms/Label.svelte';
	import RadioGroup from 'coms/RadioGroup.svelte';
	import Checkbox from 'coms/Checkbox.svelte';
	import Plus from 'coms/svg/Plus.svelte';
	import Close from 'coms/svg/Close.svelte';
	import Check from 'coms/svg/Check.svelte';
	import type { ExerciseInstance } from 'types';

	export let service: Interpreter<ExerciseContext, any, ExerciseEvent, ExerciseState>;

	const exercise = useService(service);

	let instances: ExerciseInstance[];
	$: instances = $exercise.state.context.performance?.exerciseInstances || [];

	const onExerciseInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const name = target.value;
		const list = target.list as HTMLDataListElement;
		const option = Array.from(list.options).find(
			(option: HTMLOptionElement) => option.value === name
		);
		const id = parseInt(option?.dataset.id || '', 10);
		const exerciseData = {
			name,
			id
		};
		const instanceEl = target.closest('[data-instance-id]') as HTMLFieldSetElement;
		const instanceId = parseInt(instanceEl.dataset.instanceId || '', 10);
		$exercise.send({ type: 'EXERCISE_INPUT', data: { exercise: exerciseData, instanceId } });
	};

	const onNewExecution = (instanceId: number) => {
		$exercise.send({ type: 'NEW_EXECUTION', data: { instanceId } });
	};

	const onExecInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const path = target.dataset.key || '';
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const execEl = target.closest('[data-exec-id]') as HTMLDivElement;
		const executionId = parseInt(execEl.dataset.execId || '', 10);
		const instanceEl = execEl.closest('[data-instance-id]') as HTMLFieldSetElement;
		const instanceId = parseInt(instanceEl.dataset.instanceId || '', 10);
		$exercise.send({ type: 'EXECUTION_INPUT', data: { path, value, executionId, instanceId } });
	};

	const onDeleteExec = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const execEl = target.closest('[data-exec-id]') as HTMLDivElement;
		const executionId = parseInt(execEl.dataset.execId || '', 10);
		const instanceEl = execEl.closest('[data-instance-id]') as HTMLFieldSetElement;
		const instanceId = parseInt(instanceEl.dataset.instanceId || '', 10);
		$exercise.send({ type: 'DELETE_EXECUTION', data: { executionId, instanceId } });
	};

	const onNewInstance = () => {
		$exercise.send({ type: 'NEW_INSTANCE' });
	};

	const onDeleteInstance = (instanceId: number) => {
		$exercise.send({ type: 'DELETE_INSTANCE', data: { instanceId } });
	};

	const onCancel = () => {
		$exercise.send({ type: 'CANCEL' });
	};

	const onSave = () => {
		$exercise.send({ type: 'SAVE' });
	};
</script>

<div class="p-50 bg-fg" use:scrollIntoView>
	{#each instances as instance (instance.id)}
		<fieldset data-instance-id={instance.id}>
			<div class="space-y-80">
				<div class="flex items-center space-x-50">
					<Label extClass="flex-grow">
						<span>Exercise</span>
						<input
							type="text"
							name="exercise"
							list="exercises"
							value={instance.exercise?.name || ''}
							on:input={onExerciseInput}
						/>
					</Label>
					{#if instances.length > 1}
						<button
							class="self-end text-danger-light"
							on:click={() => onDeleteInstance(instance.id)}
						>
							<Close />
						</button>
					{/if}
				</div>
				{#if $exercise.state.matches('editing.invalid')}<small class="text-danger"
						>{ui.exerciseRequired}</small
					>{/if}
				{#each instance.executions as execution, i (execution.id)}
					<div class="flex flex-col items-center space-y-50" data-exec-id={execution.id}>
						<div
							class="flex flex-col flex-grow space-y-50 px-30 py-50 border-solid border-main border-20 rounded-10 shadow-lg"
						>
							{#if instance.executions.length > 1}
								<button class="self-end text-danger-light" on:click={onDeleteExec}>
									<Close />
								</button>
							{/if}
							<div class="grid grid-cols-4 gap-x-50">
								<Label>
									<span>Sets</span>
									<input
										type="number"
										name="sets-{instance.id}-{execution.id}"
										value={execution.sets}
										data-key="sets"
										on:input={onExecInput}
									/>
								</Label>
								{#if execution.setType === SetType.time}
									<Label>
										<span>Time</span>
										<input
											type="number"
											name="time-{instance.id}-{execution.id}"
											value={execution.duration.amount}
											data-key="duration.amount"
											on:input={onExecInput}
										/>
									</Label>
								{:else}
									<Label>
										<span>Reps</span>
										<input
											type="number"
											name="reps-{instance.id}-{execution.id}"
											value={execution.reps}
											data-key="reps"
											on:input={onExecInput}
										/>
									</Label>
								{/if}
								<RadioGroup
									name="setType-{instance.id}-{execution.id}"
									options={SetType}
									selected={execution.setType}
									key="setType"
									on:change={onExecInput}
								/>
								<RadioGroup
									name="timeUnit-{instance.id}-{execution.id}"
									options={TimeUnit}
									selected={execution.duration.unit}
									key="duration.unit"
									disabled={execution.setType === SetType.reps}
									on:change={onExecInput}
								/>
							</div>
							<div class="grid grid-cols-4 gap-x-50">
								<Label extClass="col-span-1">
									<span>Weight</span>
									<input
										type="number"
										name="load"
										value={execution.load?.amount}
										data-key="load.amount"
										on:input={onExecInput}
									/>
								</Label>
								<RadioGroup
									name="loadUnit-{instance.id}-{execution.id}"
									options={LoadUnit}
									selected={execution.load.unit}
									key="load.unit"
									on:change={onExecInput}
								/>
								<Checkbox
									extClass="col-span-2"
									label="Add Bodyweight"
									name="bodyweight-{instance.id}-{execution.id}"
									key="load.bodyweight"
									checked={execution.load?.bodyweight}
									on:change={onExecInput}
								/>
							</div>
						</div>
						{#if i + 1 === instance.executions.length}
							<button
								class="p-30 border-20 border-action border-solid rounded-10 shadow-md transition-colors pointer:hover:bg-action active:bg-action _focus-default"
								aria-label="Add sets"
								on:click={() => onNewExecution(instance.id)}
							>
								<Plus extClass="w-60 h-60" />
							</button>
						{/if}
					</div>
				{/each}
			</div>
		</fieldset>
	{/each}
	<div class="flex flex-col items-end">
		<div class="grid grid-cols-2 gap-50 w-1/3">
			<button
				class="col-span-2 py-30 px-100 border-20 border-action border-solid rounded-10 shadow-md text-center transition-colors pointer:hover:bg-action active:bg-action _focus-default"
				on:click={onNewInstance}
			>
				<Plus extClass="w-full" />
			</button>
			<button
				class="py-50 px-60 rounded-10 bg-danger shadow-md transition-colors pointer:hover:bg-opacity-50 active:bg-opacity-50 _focus-default"
				aria-label="Cancel"
				on:click={onCancel}
			>
				<Close />
			</button>
			<button
				class="py-50 px-60 rounded-10 bg-action shadow-md transition-colors pointer:hover:bg-opacity-50 active:bg-opacity-50 _focus-default"
				aria-label="Confirm"
				on:click={onSave}
			>
				<Check />
			</button>
		</div>
	</div>
</div>
