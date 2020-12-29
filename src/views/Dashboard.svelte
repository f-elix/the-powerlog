<script lang="ts">
	import type { View } from '../lib/router/types';
	import Button from '@/components/Button.svelte';
	import Logout from '@/components/Logout.svelte';
	import Filters from '@/components/Filters.svelte';
	import SessionsList from '@/components/SessionsList.svelte';
	import Fab from '@/components/Fab.svelte';
	import { ui } from '@/ui';

	export let props: Record<string, unknown>;
	export let children: View[];
</script>

<section class="space-y-70 px-50 h-full overflow-y-auto">
	<div class="flex items-center justify-center relative py-50">
		<Logout extClass="absolute left-0" />
		<h1 class="text-70 font-bold">{ui.dashboardTitle}</h1>
	</div>
	<div class="flex flex-col space-y-110">
		<Filters />
		<SessionsList />
		<Button theme="success" variant="outlined">{ui.loadMore}</Button>
	</div>
	<Fab label={ui.newSession} />
</section>
