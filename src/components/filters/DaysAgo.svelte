<script lang="ts">
	// Ui
	import { ui } from 'src/ui';
	// Components
	import Label from 'coms/Label.svelte';
</script>

<Label inline={true}>
	<input class="w-1/4" type="number" name="daysAgo" on:input />
	<span class="ml-50">{ui.labels.daysAgo}</span>
</Label>
