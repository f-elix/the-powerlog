<script lang="ts">
	export let inline: boolean = false;
	export let extClass: string = '';
</script>

<style>
	:global(._input input) {
		@apply appearance-none p-30 border-solid border-b-20 border-main bg-transparent text-50 focus:outline-none text-main;
	}

	._input.inline {
		@apply flex-row items-center;
	}

	:global(._input input::-webkit-calendar-picker-indicator) {
		filter: invert(1);
		opacity: 0.5;
	}
</style>

<label
	class:inline
	class="_input flex flex-col transition-colors focus-within:text-highlight {extClass}">
	<slot />
</label>
