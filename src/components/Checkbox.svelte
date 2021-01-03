<script>
	export let checked: boolean = false;
	export let label: string = '';
	export let name: string = '';
</script>

<style>
	._checkbox-input:checked ~ ._checkbox {
		@apply bg-black;
	}

	._checkbox-input:checked ~ ._checkbox ._checkmark {
		@apply border-highlight-lighter;
	}

	._checkbox-input:focus ~ ._checkbox {
		@apply ring-highlight ring-2 outline-none;
	}
</style>

<label class="flex items-center space-x-30 cursor-pointer self-end">
	<input
		class="_checkbox-input absolute w-0 h-0 opacity-0"
		type="checkbox"
		{name}
		bind:checked
		on:change />
	<div class="_checkbox relative w-70 h-70 bg-white">
		<div
			class="_checkmark absolute top-1/2 left-1/2 w-9/12 h-1/2 border-solid border-transparent border-b-20 border-l-20 transform -rotate-45 -translate-x-1/2 -translate-y-2/3" />
	</div>
	<span>{label}</span>
</label>
