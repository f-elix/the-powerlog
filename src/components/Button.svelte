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

	enum Type {
		button = 'button',
		submit = 'submit'
	}

	export let variant: Variant = Variant.filled;
	export let theme: Theme = Theme.primary;
	export let type: Type = Type.button;
	export let href: string | undefined = undefined;
</script>

{#if href}
	<a
		{href}
		class="{variant} {theme} _button py-50 text-center font-bold rounded-10 shadow-lg transition-colors _focus-default">
		<slot />
	</a>
{:else}
	<button
		{type}
		class="{variant} {theme} _button py-50 text-center font-bold rounded-10 shadow-lg transition-colors _focus-default"
		on:click>
		<slot />
	</button>
{/if}

<style>
	._button.filled {
		background-color: var(--theme);
	}

	._button.primary {
		@apply border-primary bg-primary;
	}

	._button.info {
		@apply border-info bg-info;
	}

	._button.success {
		@apply border-success bg-success;
	}

	._button.danger {
		@apply border-danger bg-danger;
	}

	._button.filled,
	._button.outlined {
		@apply border-solid border-20;
	}

	._button.outlined {
		@apply bg-opacity-0;
	}

	._button:active {
		@apply bg-opacity-50 border-opacity-0;
	}

	@screen pointer {
		._button:hover {
			@apply bg-opacity-50 border-opacity-0;
		}
	}
</style>
