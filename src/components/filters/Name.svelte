<script lang="ts">
	// Ui
	import { ui } from 'src/ui';
	// Components
	import Label from 'coms/Label.svelte';
</script>

<Label><span>{ui.labels.sessionName}</span> <input type="text" name="name" on:input /></Label>
