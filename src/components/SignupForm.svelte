<script lang="ts">
	import Label from 'src/components/Label.svelte';
	import Button from 'src/components/Button.svelte';
	import { ui } from 'src/ui';

</script>

<form>
	<Label>
		<input type="text" name="name" required />
	</Label>
	<Label>
		<input type="email" name="email" required />
	</Label>
	<Label>
		<input type="password" name="password" required />
	</Label>
	<Button>{ui.signup}</Button>
</form>
