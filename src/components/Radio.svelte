<script>
	export let value: string = '';
	export let name: string = '';
	export let checked: boolean = false;
	export let disabled: boolean = false;

	const label = value;
</script>

<style>
	._radio-input:checked ~ ._radio {
		@apply bg-black;
	}

	._radio-input:focus ~ ._radio {
		@apply border-highlight-lighter;
	}

	.disabled {
		@apply opacity-50;
	}
</style>

<label class="flex items-center cursor-pointer space-x-30" class:disabled>
	<input
		type="radio"
		class="_radio-input absolute w-0 h-0 opacity-0"
		{value}
		{name}
		{checked}
		{disabled}
		on:change />
	<div class="_radio w-70 h-70 rounded-full bg-white border-20 border-solid border-white" />
	<div class="capitalize">{label}</div>
</label>
