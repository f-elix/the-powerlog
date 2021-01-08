<script lang="ts">
	// Types
	import type { Session } from 'types';
	// Utils
	import { getLocalDate, days } from 'src/utils';
	// Components
	import Button from 'coms/Button.svelte';

	export let session: Session;
</script>

<Button href="/session/{session.id}">
	<div class="flex flex-col space-y-30 px-50 text-left">
		<span class="text-50">{session.title}</span>
		<div class="flex items-center font-normal">
			<span>{days[getLocalDate(session.date).getDay()]}</span>
			<span>&nbsp;</span>
			<span>{session.date.split('T')[0]}</span>
		</div>
	</div>
</Button>
