<script lang="ts">
	import { ui } from '@/ui';
</script>

<label class="_filter flex flex-col ">
	<span class="p-30 text-40">{ui.labels.sessionName}</span>
	<input type="text" name="name" on:input />
</label>
