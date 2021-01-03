<script lang="ts">
	import Plus from 'coms/svg/Plus.svelte';

	enum Variant {
		filled = 'filled',
		outlined = 'outlined'
	}

	export let label: string;
	export let variant: Variant = Variant.filled;
</script>

<style>
	.outlined {
		@apply bg-main;
	}

	button {
		@apply transition-all;
	}

	button:active {
		@apply transform translate-y-20;
		@apply border-opacity-0;
	}

	@screen pointer {
		button:hover {
			@apply border-opacity-0;
		}
	}
</style>

<button
	class="fixed bottom-110 right-80 w-120 h-120 rounded-full border-action border-solid border-20 bg-action shadow-md transition-colors  _focus-default {variant}"
	aria-label={label}
	on:click>
	<div class="flex items-center justify-center">
		<Plus extClass="w-80 h-80" />
	</div>
</button>
