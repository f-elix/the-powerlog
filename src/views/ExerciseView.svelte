<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { ExerciseInstance } from 'types';
	// Stores
	import { exerciseDetail } from 'src/stores/exerciseDetail';
	// Components
	import Nav from 'coms/Nav.svelte';
	import Spinner from 'coms/Spinner.svelte';
	import ExerciseExecution from 'coms/ExerciseExecution.svelte';

	export let props: ViewProps;
	export let children: View[];

	const exerciseId = props.context.$page.params?.id;

	$exerciseDetail.send({ type: 'GET_EXERCISE', data: { exerciseId } });

	$: exercise = $exerciseDetail.state.context.exercise;
	$: instances = exercise?.exerciseInstances as ExerciseInstance[];
</script>

<Nav {props} />
{#if $exerciseDetail.state.matches('fetching')}
	<div class="flex items-center justify-center h-100vh">
		<Spinner />
	</div>
{/if}
<section class="space-y-100">
	{#if exercise}
		<h1 class="px-50 text-center text-70 font-bold">{exercise.name}</h1>
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
