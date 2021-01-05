<script lang="ts">
	import Radio from 'coms/Radio.svelte';

	export let options: object = {};
	export let name: string = '';
	export let selected: string;
	export let disabled: boolean = false;

	const optionsArray = Object.values(options);
</script>

<div class="flex flex-col justify-between self-stretch">
	{#each optionsArray as option}
		<Radio value={option} {name} checked={selected === option} {disabled} />
	{/each}
</div>
