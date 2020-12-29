<script lang="ts">
	import { ui } from '@/ui';
</script>

<label class="_filter flex items-center">
	<input class="w-1/4" type="number" name="Days ago" on:input />
	<span class="ml-50">{ui.labels.daysAgo}</span>
</label>
