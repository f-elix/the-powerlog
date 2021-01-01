<script lang="ts">
	// Types
	import type { Session } from 'types';
	// Components
	import Button from 'coms/Button.svelte';

	export let session: Session;
</script>

<Button>
	<div class="flex flex-col space-y-30 px-50 text-left">
		<span class="text-50">{session.name}</span>
		<span class="font-normal">{session.date}</span>
	</div>
</Button>
