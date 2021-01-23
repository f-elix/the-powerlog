<script lang="ts">
	// Types
	import type { UseServiceOutput } from 'src/lib/xstate-svelte';
	// Svelte
	import { getContext } from 'svelte';
	// Components
	import Reorder from 'coms/svg/Reorder.svelte';
	import History from 'coms/svg/History.svelte';
	import Delete from 'coms/svg/Delete.svelte';

	const modes: UseServiceOutput = getContext('modes');

	const onReorder = () => {
		$modes.send({ type: 'REORDER' });
	};

	const onHistory = () => {
		$modes.send({ type: 'HISTORY' });
	};

	const onDelete = () => {
		$modes.send({ type: 'DELETE' });
	};
</script>

<div class="flex items-center justify-end px-50">
	<button
		type="button"
		class:_reorder={$modes.state.matches('enabled.reordering')}
		class="p-70 rounded-10 text-gray"
		aria-label="Reorder"
		on:click={onReorder}>
		<Reorder />
	</button>
	<button
		type="button"
		class:_history={$modes.state.matches('enabled.history')}
		class="p-70 rounded-10 text-gray"
		aria-label="History"
		on:click={onHistory}>
		<History />
	</button>
	<button
		type="button"
		class:_delete={$modes.state.matches('enabled.deleting')}
		class="p-70 rounded-10 text-gray"
		aria-label="Delete"
		on:click={onDelete}>
		<Delete />
	</button>
</div>

<style>
	._reorder {
		@apply bg-info-light text-white;
	}

	._history {
		@apply bg-highlight text-white;
	}

	._delete {
		@apply bg-danger text-white;
	}
</style>
