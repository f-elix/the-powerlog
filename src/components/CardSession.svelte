<script lang="ts">
	// Types
	import type { Session } from 'types';
	// Utils
	import { getLocalDate, days, formatDate } from 'src/utils';
	// Components
	import Button from 'coms/Button.svelte';

	export let session: Session;

	const localDate = getLocalDate(session.date);
	const day = days[localDate.getDay()];
</script>

<Button href="/session/{session.id}">
	<div class="flex flex-col space-y-30 px-50 text-left">
		<span class="text-50">{session.title}</span>
		<div class="flex items-center font-normal">
			<span>{day}</span>
			<span>&nbsp;</span>
			<span>{formatDate(localDate)}</span>
		</div>
	</div>
</Button>
