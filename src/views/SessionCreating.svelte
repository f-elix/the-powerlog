<script lang="ts">
	// Machines
	import { router } from 'src/router';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import SessionForm from 'coms/SessionForm.svelte';

	export let props;
	export let children;

	const onCancel = () => {
		router.send('DASHBOARD');
	};
</script>

<section class="space-y-100">
	<h1 class="mt-70 px-50 text-70 font-bold">{ui.creatingSession}</h1>
	<SessionForm on:cancel={onCancel} />
</section>
