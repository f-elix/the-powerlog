<script lang="ts">
	enum Variant {
		filled = 'filled',
		outlined = 'outlined'
	}

	enum Theme {
		primary = 'primary',
		info = 'info',
		success = 'success',
		danger = 'danger'
	}

	export let variant: Variant = Variant.filled;
	export let theme: Theme = Theme.primary;
</script>

<style>
	button.filled {
		background-color: var(--theme);
	}

	button.primary {
		@apply border-primary bg-primary;
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
	class="{variant} {theme} py-50 font-bold rounded-10 shadow-lg transition-colors ring-2 ring-opacity-0 ring-highlight focus-visible:ring-opacity-100"
	on:click>
	<slot />
</button>
