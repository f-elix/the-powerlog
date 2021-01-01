<script lang="ts">
	import { ui } from 'src/ui';
</script>

<label class="_filter flex flex-col">
	<span>{ui.labels.sessionDate}</span>
	<input type="date" name="Days ago" on:input />
</label>
