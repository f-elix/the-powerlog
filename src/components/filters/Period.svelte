<script lang="ts">
	// Svelte
	import { createEventDispatcher } from 'svelte';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import Label from 'coms/Label.svelte';

	const dispatch = createEventDispatcher();

	const value: { from?: string; to?: string } = { from: undefined, to: undefined };

	const onPeriodInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (!target) {
			return;
		}
		const name: string = target.name;
		if (name === 'from' || name === 'to') {
			value[name] = target.value;
		}
		if (!value.from || !value.to) {
			return;
		}
		if (new Date(value.from) < new Date(value.to)) {
			dispatch('input', { value, filterType: 'period' });
		}
	};
</script>

<div class="grid grid-cols-2 gap-50">
	<Label>
		<span>{ui.labels.to}</span>
		<input type="date" name="from" on:input={onPeriodInput} />
	</Label>
	<Label>
		<span>{ui.labels.from}</span>
		<input type="date" name="to" on:input={onPeriodInput} />
	</Label>
</div>
