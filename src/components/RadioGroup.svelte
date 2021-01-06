<script lang="ts">
	import Radio from 'coms/Radio.svelte';

	export let options: object = {};
	export let name: string = '';
	export let selected: string;
	export let disabled: boolean = false;
	export let key: string = '';

	const optionsArray = Object.values(options);
</script>

<div class="flex flex-col justify-between self-stretch">
	{#each optionsArray as option}
		<Radio value={option} {name} {key} checked={selected === option} {disabled} on:change />
	{/each}
</div>
