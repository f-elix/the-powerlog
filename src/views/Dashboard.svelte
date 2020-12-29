<script lang="ts">
	import type { View } from '../lib/router/types';
	import Logout from '@/components/Logout.svelte';
	import Filters from '@/components/Filters.svelte';
	import { ui } from '@/ui';

	export let props: Record<string, unknown>;
	export let children: View[];
</script>

<section class="px-50 h-full overflow-y-auto">
	<div class="flex items-center justify-center relative py-50">
		<Logout extClass="absolute left-0" />
		<h1 class="text-70 font-bold">{ui.dashboardTitle}</h1>
	</div>
	<Filters />
</section>
