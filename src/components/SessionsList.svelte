<script lang="ts">
	// Machines
	import { log } from 'src/stores/log';
	// Components
	import CardSession from 'coms/CardSession.svelte';

	const { state } = log;

	$: sessions = $state.context.sessions;
	$: console.log(sessions);
</script>

<div>
	<h2 class="mb-70 text-60 font-bold text-highlight">December 2020</h2>
	<ul class="flex flex-col space-y-50">
		{#if sessions}
			{#each sessions as session (session?.id)}
				<li class="flex flex-col">
					<CardSession {session} />
				</li>
			{/each}
		{/if}
	</ul>
</div>
