<script lang="ts">
	// Types
	import type { Modes } from 'src/machines/session';
	// Svelte
	import { getContext } from 'svelte';
	// Components
	import Reorder from 'coms/svg/Reorder.svelte';
	import History from 'coms/svg/History.svelte';
	import Delete from 'coms/svg/Delete.svelte';

	const modes: Modes = getContext('modes');

	const classBtns = 'px-60 py-50 rounded-10 text-gray transition-colors duration-100 ease-out';
	const classIcons = 'w-80 h-80';

	const onReorder = () => {
		modes.send({ type: 'REORDER' });
	};

	const onHistory = () => {
		modes.send({ type: 'HISTORY' });
	};

	const onDelete = () => {
		modes.send({ type: 'DELETE' });
	};
</script>

<div class="flex items-center justify-end px-50" class:_disabled={$modes.matches('disabled')}>
	<button
		type="button"
		class:_reorder={$modes.matches('enabled.reordering')}
		class={classBtns}
		aria-label="Reorder"
		on:click={onReorder}
	>
		<Reorder extClass={classIcons} />
	</button>
	<button
		type="button"
		class:_history={$modes.matches('enabled.history')}
		class={classBtns}
		aria-label="History"
		on:click={onHistory}
	>
		<History extClass={classIcons} />
	</button>
	<button
		type="button"
		class:_delete={$modes.matches('enabled.deleting')}
		class={classBtns}
		aria-label="Delete"
		on:click={onDelete}
	>
		<Delete extClass={classIcons} />
	</button>
</div>

<style>
	._disabled {
		@apply opacity-25;
	}

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
