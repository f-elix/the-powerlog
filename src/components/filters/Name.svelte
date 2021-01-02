<script lang="ts">
	// Ui
	import { ui } from 'src/ui';
</script>

<label class="_filter flex flex-col ">
	<span class="p-30 text-40">{ui.labels.sessionName}</span>
	<input type="text" name="name" on:input />
</label>
