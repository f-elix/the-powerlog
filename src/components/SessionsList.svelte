<script lang="ts">
	// Types
	import type { Session } from 'types';
	// Svelte
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	// Utils
	import { getLocalDate, isFirstOfWeek } from 'src/utils';
	// Components
	import CardSession from 'coms/CardSession.svelte';

	export let sessions: Session[];
</script>

<div>
	<ul class="flex flex-col space-y-50">
		{#each sessions as session, i (session?.id)}
			{#if !sessions[i - 1] || getLocalDate(session.date).getMonth() !== getLocalDate(sessions[i - 1].date).getMonth()}
				<h2 class="mb-70 text-60 font-bold text-highlight-lighter">
					{getLocalDate(session.date).toLocaleString('default', { month: 'long' })}
					{getLocalDate(session.date).getFullYear()}
				</h2>
			{/if}
			<li
				class="flex flex-col"
				in:fly|local={{ y: -30, easing: expoOut, duration: 400, delay: i * 80 }}
			>
				<CardSession {session} />
			</li>
			{#if isFirstOfWeek(sessions, session.date, i)}
				<hr class="h-10 w-3/4 mx-auto border-none bg-highlight-lighter" />
			{/if}
		{/each}
	</ul>
</div>
