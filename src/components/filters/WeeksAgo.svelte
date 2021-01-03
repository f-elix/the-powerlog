<script lang="ts">
	import { ui } from 'src/ui';
</script>

<label class="_input flex items-center">
	<input class="w-1/4" type="number" name="weeksAgo" on:input />
	<span class="ml-50">{ui.labels.weeksAgo}</span>
</label>
