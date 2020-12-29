<script lang="ts">
	import { ui } from '@/ui';
	import Name from '@/components/filters/Name.svelte';
	import DaysAgo from '@/components/filters/DaysAgo.svelte';
	import WeeksAgo from '@/components/filters/WeeksAgo.svelte';
	import Date from '@/components/filters/Date.svelte';
	import Period from '@/components/filters/Period.svelte';

	import type { Filter } from '@/ui';
	import type { SvelteComponentDev } from 'svelte/internal';

	const filters: Filter[] = ui.filters;
	const filterComponents: Record<string, typeof SvelteComponentDev> = {
		Name,
		DaysAgo,
		WeeksAgo,
		Date,
		Period
	};

	let selectedFilter = filters[4].component;

	const onFilterInput = (e: InputEvent) => {};
</script>

<div class="flex flex-col space-y-70">
	<label class="w-full flex flex-col space-y-70">
		<span>{ui.filterBy}</span>
		<select
			class="bg-main border-main border-solid border-20 rounded-10 p-30 text-main"
			bind:value={selectedFilter}
			name="filters">
			{#each filters as filter}
				<option value={filter.component}>{filter.name}</option>
			{/each}
		</select>
	</label>
	<svelte:component this={filterComponents[selectedFilter]} on:input={onFilterInput} />
</div>
