<script lang="ts">
	export let variant = 'filled'; // Filled, outlined
	export let theme = 'info'; // Info, success, danger
</script>

<style>
	button.filled {
		background-color: var(--theme);
	}

	button.info {
		@apply border-info bg-info;
	}

	button.success {
		@apply border-success bg-success;
	}

	button.danger {
		@apply border-danger bg-danger;
	}

	button.filled,
	button.outlined {
		@apply border-solid border-20;
	}

	button.outlined {
		@apply bg-opacity-0;
	}

	button:active,
	button:hover {
		@apply bg-opacity-50 border-opacity-0;
	}
</style>

<button
	class="{variant} {theme} py-50 font-bold rounded-10 shadow-lg transition-colors ring-2 ring-transparent focus-visible:ring-highlight"
	on:click>
	<slot />
</button>
