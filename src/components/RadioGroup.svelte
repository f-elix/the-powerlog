<script lang="ts">
	import Radio from 'coms/Radio.svelte';

	interface Option {
		label: string;
		value: string;
		checked?: boolean;
	}

	export let options: Option[] = [];
	export let name: string = '';
</script>

<div class="flex flex-col justify-around self-stretch">
	{#each options as { label, value, checked }}
		<Radio {label} {value} {checked} {name} />
	{/each}
</div>
