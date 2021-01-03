<script lang="ts">
	// Types
	import type { Filter } from 'src/ui';
	import type { SvelteComponentDev } from 'svelte/internal';
	// Machines
	import { log } from 'src/stores/log';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import Name from 'coms/filters/Name.svelte';
	import DaysAgo from 'coms/filters/DaysAgo.svelte';
	import WeeksAgo from 'coms/filters/WeeksAgo.svelte';
	import Date from 'coms/filters/Date.svelte';
	import Period from 'coms/filters/Period.svelte';

	export let token: string;

	const { state } = log;

	const filters: Filter[] = ui.filters as Filter[];
	const filterComponents: Record<string, typeof SvelteComponentDev> = {
		Name,
		DaysAgo,
		WeeksAgo,
		Date,
		Period
	};

	let selectedFilter = filters[0].component;

	const onFilterInput = (e: InputEvent | CustomEvent) => {
		const target = e.target as HTMLInputElement;
		const detail = e.detail;
		if (!target && !detail) {
			return;
		}
		const filterType = target?.name || detail?.filterType;
		const value = { [target?.name]: target?.value } || detail?.value;
		log.send({ type: 'FILTER', data: { token, filterType, value } });
	};

	const onClearFilters = () => {
		log.send({ type: 'CLEAR' });
	};
</script>

<div id="filters" class="flex flex-col relative space-y-70">
	{#if $state.matches('filtered')}
		<button
			on:click={onClearFilters}
			class="absolute top-60 right-0 px-30 border-solid border-danger-light border-20 rounded-10 transition-colors focus:bg-danger-light hover:bg-danger-light active:bg-danger-light">{ui.clearFilters}</button>
	{/if}
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
