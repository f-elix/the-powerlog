<script lang="ts">
	export let inline: boolean = false;
	export let extClass: string = '';
</script>

<label
	class:inline
	class="_input flex flex-col transition-colors focus-within:text-highlight-lighter {extClass}">
	<slot />
</label>

<style>
	._input :global(input) {
		@apply appearance-none p-30 border-solid border-b-20 border-main bg-transparent text-50 focus:outline-none text-main;
	}

	._input :global(input::-webkit-calendar-picker-indicator) {
		filter: invert(1);
		opacity: 0.5;
	}

	._input.inline {
		@apply flex-row items-center;
	}
</style>
