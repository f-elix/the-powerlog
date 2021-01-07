<script lang="ts">
	// Ui
	import { ui } from 'src/ui';
	// Components
	import Label from 'coms/Label.svelte';
</script>

<Label><span>{ui.labels.sessionDate}</span> <input type="date" name="date" on:input /></Label>
