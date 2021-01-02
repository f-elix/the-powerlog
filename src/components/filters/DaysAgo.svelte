<script lang="ts">
	import { ui } from 'src/ui';
</script>

<label class="_filter flex items-center">
	<input class="w-1/4" type="number" name="daysAgo" on:input />
	<span class="ml-50">{ui.labels.daysAgo}</span>
</label>
