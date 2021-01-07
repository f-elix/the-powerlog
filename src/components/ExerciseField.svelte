<script lang="ts">
	// Types
	import type { Interpreter } from 'xstate';
	import { SetType, TimeUnit, LoadUnit } from 'src/utils';
	import type { ExerciseContext, ExerciseEvent, ExerciseState } from 'src/machines/exercise';
	// xstate-svelte
	import { useService } from 'xstate-svelte';
	// Components
	import Label from 'coms/Label.svelte';
	import RadioGroup from 'coms/RadioGroup.svelte';
	import Checkbox from 'coms/Checkbox.svelte';
	import Plus from 'coms/svg/Plus.svelte';

	export let service: Interpreter<ExerciseContext, any, ExerciseEvent, ExerciseState>;

	const { state, send } = useService(service);

	const onExerciseInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const name = target.value;
		const list = target.list as HTMLDataListElement;
		const option = Array.from(list.options).find(
			(option: HTMLOptionElement) => option.value === target.value
		);
		const id = parseInt(option?.dataset.id || '', 10);
		send({ type: 'EXERCISE_INPUT', data: { exercise: { name, id } } });
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

	const onCancel = () => {
		send({ type: 'CANCEL' });
	};

	const onSave = () => {
		send({ type: 'SAVE' });
	};

	$: executions = $state.context.instance.executions;
</script>

<fieldset>
	<div class="space-y-80 p-50 bg-fg">
		<Label>
			<span>Exercise</span>
			<input type="text" name="exercise" list="exercises" on:input={onExerciseInput} />
		</Label>
		{#each executions as execution, i (execution.id)}
			<div class="flex items-center justify-between space-x-50" data-id={execution.id}>
				<div
					class="flex-grow space-y-50 p-30 border-solid border-main border-20 rounded-10 shadow-lg">
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
				<button
					class="p-30 border-20 border-action border-solid rounded-10 shadow-md transition-colors pointer:hover:bg-action active:bg-action _focus-default"
					aria-label="Add sets"
					on:click={onNewExecution}>
					<Plus extClass="w-60 h-60" />
				</button>
			</div>
		{/each}
		<div class="flex flex-col items-end">
			<div class="flex items-center space-x-50">
				<button
					class="p-40 rounded-10 bg-danger shadow-md transition-colors pointer:hover:bg-opacity-50 active:bg-opacity-50 _focus-default"
					aria-label="Cancel"
					on:click={onCancel}>
					<svg
						width="22"
						height="19"
						viewBox="0 0 22 19"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M19.7201 0.26001H2.56008C1.46695 0.26001 0.580078 1.14688 0.580078 2.24001V16.76C0.580078 17.8531 1.46695 18.74 2.56008 18.74H19.7201C20.8132 18.74 21.7001 17.8531 21.7001 16.76V2.24001C21.7001 1.14688 20.8132 0.26001 19.7201 0.26001ZM16.2716 12.2431C16.4696 12.4411 16.4696 12.7629 16.2716 12.9609L14.601 14.6315C14.403 14.8295 14.0812 14.8295 13.8832 14.6315L11.1401 11.8636L8.39695 14.6315C8.19895 14.8295 7.8772 14.8295 7.6792 14.6315L6.00858 12.9609C5.81058 12.7629 5.81058 12.4411 6.00858 12.2431L8.77645 9.50001L6.00858 6.75688C5.81058 6.55888 5.81058 6.23713 6.00858 6.03913L7.6792 4.36851C7.8772 4.17051 8.19895 4.17051 8.39695 4.36851L11.1401 7.13638L13.8832 4.36851C14.0812 4.17051 14.403 4.17051 14.601 4.36851L16.2716 6.03913C16.4696 6.23713 16.4696 6.55888 16.2716 6.75688L13.5037 9.50001L16.2716 12.2431Z"
							fill="#F9FAFB" />
					</svg>
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
							fill="#F9FAFB" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</fieldset>
