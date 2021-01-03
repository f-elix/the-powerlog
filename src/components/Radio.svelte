<script>
	export let label: string = '';
	export let value: string = '';
	export let name: string = '';
	export let checked = false;
</script>

<style>
	._radio-input:checked ~ ._radio {
		@apply bg-black;
	}

	._radio-input:focus ~ ._radio {
		@apply border-highlight-lighter;
	}
</style>

<label class="flex items-center cursor-pointer space-x-30">
	<input
		type="radio"
		class="_radio-input absolute w-0 h-0 opacity-0"
		{value}
		{name}
		{checked}
		on:change />
	<div class="_radio w-70 h-70 rounded-full bg-white border-20 border-solid border-white" />
	<div>{label}</div>
</label>
