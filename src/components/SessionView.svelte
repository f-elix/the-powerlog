<script lang="ts">
	// Svelte
	import { createEventDispatcher } from 'svelte';
	// Types
	import type { Session } from 'types';
	// Utils
	import { getLocalDate, days } from 'src/utils';
	// Components
	import ExerciseData from 'coms/ExerciseData.svelte';
	import Button from 'coms/Button.svelte';

	export let session: Session;

	const dispatch = createEventDispatcher();

	const exercises = session.exercises || [];

	const onEdit = () => {
		dispatch('edit');
	};

	const onDelete = () => {
		dispatch('delete');
	};

	const onBack = () => {
		dispatch('back');
	};
</script>

<section class="flex flex-col min-h-100vh space-y-100 py-100">
	<div class="text-center">
		<h1 class="px-50 text-70 font-bold">{session.title}</h1>
		<h2>{days[getLocalDate(session.date).getDay()]} {session.date}</h2>
	</div>
	<ul>
		{#each exercises as instance (instance.id)}
			<li class="bg-fg-light odd:bg-fg">
				<ExerciseData {instance} />
			</li>
		{/each}
	</ul>
	<div class="flex flex-col space-y-70 px-50">
		<Button theme="success" on:click={onEdit}>Edit</Button>
		<Button theme="danger" on:click={onDelete}>Delete</Button>
		<Button variant="outlined" on:click={onBack}>Back</Button>
	</div>
</section>
