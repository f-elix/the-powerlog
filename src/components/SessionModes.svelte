<script lang="ts">
	// Svelte
	import { getContext } from 'svelte';
	// Components
	import Reorder from 'coms/svg/Reorder.svelte';
	import History from 'coms/svg/History.svelte';
	import Delete from 'coms/svg/Delete.svelte';

	const { state, send } = getContext('modes');

	const onReorder = () => {
		send({ type: 'REORDER' });
	};

	const onHistory = () => {
		send({ type: 'HISTORY' });
	};

	const onDelete = () => {
		send({ type: 'DELETE' });
	};
</script>

<div class="flex items-center justify-end space-x-80 px-50">
	<button
		type="button"
		class:_reorder={$state.matches('enabled.reordering')}
		class="w-100 h-100 text-gray"
		aria-label="Reorder"
		on:click={onReorder}>
		<Reorder />
	</button>
	<button
		type="button"
		class:_history={$state.matches('enabled.history')}
		class="w-100 h-100 text-gray"
		aria-label="History"
		on:click={onHistory}>
		<History />
	</button>
	<button
		type="button"
		class:_delete={$state.matches('enabled.deleting')}
		class="w-100 h-100 text-gray"
		aria-label="Delete"
		on:click={onDelete}>
		<Delete />
	</button>
</div>

<style>
	._reorder {
		@apply text-info-light;
	}

	._history {
		@apply text-highlight-lighter;
	}

	._delete {
		@apply text-danger;
	}
</style>
