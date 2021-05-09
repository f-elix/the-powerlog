<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { ExerciseInstance } from 'types';
	// Stores
	import { exerciseDetail } from 'src/stores/exerciseDetail';
	// Components
	import Nav from 'coms/Nav.svelte';
	import Label from 'coms/Label.svelte';
	import ExerciseExecution from 'coms/ExerciseExecution.svelte';
	import Spinner from 'coms/Spinner.svelte';
	import Edit from 'coms/svg/Edit.svelte';
	import Close from 'coms/svg/Close.svelte';
	import Check from 'coms/svg/Check.svelte';

	export let props: ViewProps;
	export let children: View[];

	const { state: exerciseDetailState, service } = exerciseDetail;
	service.start();

	const exerciseId = parseInt(props.context.$page?.params?.id || '', 10);

	exerciseDetail.send({ type: 'GET_EXERCISE', data: { exerciseId } });

	$: exercise = $exerciseDetailState.context.exercise;
	$: instances = exercise?.exerciseInstances as ExerciseInstance[];

	const onEditExerciseName = () => {
		exerciseDetail.send('EDIT_EXERCISE_NAME');
	};

	const onCancelEditExerciseName = () => {
		exerciseDetail.send('CANCEL');
	};

	const onSaveExerciseName = (e: Event) => {
		const form = e.currentTarget as HTMLFormElement;
		const data = Object.fromEntries(new FormData(form));
		exerciseDetail.send('SAVE', { data });
	};
</script>

<Nav {props} />
{#if $exerciseDetailState.matches('fetching')}
	<div class="flex items-center justify-center h-100vh">
		<Spinner />
	</div>
{/if}
<section class="space-y-100">
	{#if exercise}
		<div class="flex items-baseline justify-center space-x-50 px-50">
			{#if $exerciseDetailState.matches('loaded')}
				<h1 class="text-center text-70 font-bold">{exercise.name}</h1>
				<button on:click={onEditExerciseName} class="text-fg-lighter"><Edit /></button>
			{/if}
			{#if $exerciseDetailState.matches('editing')}
				<form
					class="flex flex-col items-end space-y-50"
					novalidate
					on:submit|preventDefault={onSaveExerciseName}
				>
					<Label>
						<span>Exercise name</span>
						<input type="text" name="exerciseName" value={exercise.name} />
					</Label>
					<div class="flex items-center space-x-50">
						<button
							class="py-30 px-40 rounded-10 bg-danger shadow-md transition-colors pointer:hover:bg-opacity-50 active:bg-opacity-50 _focus-default"
							type="button"
							aria-label="Cancel"
							on:click={onCancelEditExerciseName}><Close /></button
						>
						<button
							class="py-30 px-40 rounded-10 bg-action shadow-md transition-colors pointer:hover:bg-opacity-50 active:bg-opacity-50 _focus-default"
							type="submit"
							aria-label="Confirm"><Check /></button
						>
					</div>
				</form>
			{/if}
			{#if $exerciseDetailState.matches('updatingExercise')}
				<div class="w-110">
					<Spinner />
				</div>
			{/if}
		</div>
		<ul>
			{#each instances as instance}
				<li class="p-50 bg-fg-light odd:bg-fg">
					<h2 class="mb-40 font-bold">
						{instance.performance?.session?.date.split('T')[0]}
					</h2>
					<ul>
						{#each instance.executions as execution}
							{#if !!execution.sets}
								<li>
									<ExerciseExecution {execution} />
								</li>
							{/if}
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	{/if}
</section>
