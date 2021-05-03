<script lang="ts">
	// Types
	import type { SvelteComponentDev } from 'svelte/internal';
	// Machines
	import { log } from 'src/stores/log';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import Label from 'coms/Label.svelte';
	import Name from 'coms/filters/Name.svelte';
	import DaysAgo from 'coms/filters/DaysAgo.svelte';
	import WeeksAgo from 'coms/filters/WeeksAgo.svelte';
	import Date from 'coms/filters/Date.svelte';
	import Period from 'coms/filters/Period.svelte';

	const filterOptions = [
		{
			name: 'Name',
			component: 'Name'
		},
		{
			name: 'Days ago',
			component: 'DaysAgo'
		},
		{
			name: 'Weeks ago',
			component: 'WeeksAgo'
		},
		{
			name: 'Date',
			component: 'Date'
		},
		{
			name: 'Period',
			component: 'Period'
		}
	];

	const filterComponents: Record<string, typeof SvelteComponentDev> = {
		Name,
		DaysAgo,
		WeeksAgo,
		Date,
		Period
	};

	let selectedFilter = filterOptions[0].component;

	const onClearFilters = () => {
		$log.send({ type: 'CLEAR' });
	};

	const onFilterInput = (e: InputEvent | CustomEvent) => {
		const target = e.target as HTMLInputElement;
		const detail = e.detail;
		if (!target && !detail) {
			return;
		}
		const filterType = target?.name || detail?.filterType;
		const targetValue = target?.value;
		const detailValue = detail?.value;
		if (!targetValue && !detailValue) {
			onClearFilters();
			return;
		}
		const value = target ? { [target?.name]: targetValue } : detailValue;
		const debounce = ['name', 'daysAgo', 'weeksAgo'].includes(filterType);
		$log.send({ type: 'FILTER', data: { filterType, value, debounce } });
	};
</script>

<div id="filters" class="flex flex-col relative">
	{#if $log.state.hasTag('clear-btn')}
		<button
			on:click={onClearFilters}
			class="absolute top-0 right-0 px-30 border-solid border-danger-light border-20 rounded-10 transition-colors focus:bg-danger-light pointer:hover:bg-danger-light active:bg-danger-light"
			>{ui.clearFilters}</button
		>
	{/if}
	<Label extClass="mb-70 space-y-70">
		<span>{ui.filterBy}</span>
		<select
			class="bg-main border-main border-solid border-20 rounded-10 p-30 text-main"
			bind:value={selectedFilter}
			name="filters"
		>
			{#each filterOptions as filter}
				<option value={filter.component}>{filter.name}</option>
			{/each}
		</select>
	</Label>
	<svelte:component this={filterComponents[selectedFilter]} on:input={onFilterInput} />
</div>
