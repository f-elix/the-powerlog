<script lang="ts">
	import { ui } from 'src/ui';
</script>

<div class="grid grid-cols-2 gap-50">
	<label class="_filter flex flex-col">
		<span>{ui.labels.to}</span>
		<input type="date" name="Days ago" on:input />
	</label>
	<label class="_filter flex flex-col">
		<span>{ui.labels.from}</span>
		<input type="date" name="Days ago" on:input />
	</label>
</div>
