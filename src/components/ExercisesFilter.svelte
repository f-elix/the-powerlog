<script lang="ts">
	// Ui
	import { ui } from 'src/ui';
	// Components
	import Label from 'coms/Label.svelte';
</script>

<Label>
	<span>{ui.exerciseFilterLabel}</span>
	<input type="search" name="search-exercises" on:input />
</Label>
