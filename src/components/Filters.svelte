<script lang="ts">
	import { ui } from 'src/ui';
	import Name from 'coms/filters/Name.svelte';
	import DaysAgo from 'coms/filters/DaysAgo.svelte';
	import WeeksAgo from 'coms/filters/WeeksAgo.svelte';
	import Date from 'coms/filters/Date.svelte';
	import Period from 'coms/filters/Period.svelte';

	import type { Filter } from 'src/ui';
	import type { SvelteComponentDev } from 'svelte/internal';

	const filters: Filter[] = ui.filters as Filter[];
	const filterComponents: Record<string, typeof SvelteComponentDev> = {
		Name,
		DaysAgo,
		WeeksAgo,
		Date,
		Period
	};

	let selectedFilter = filters[0].component;

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
