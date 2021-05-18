<script lang="ts">
	import { useMachine } from '@xstate/svelte';
	import { modal } from 'src/machines/modal';
	import { trapFocus } from 'src/lib/focus-trap';
	import { fade, fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	export let id: string;

	const { state, send } = useMachine(modal(id), {
		actions: {
			addKeydownListener: () => {
				window.addEventListener('keydown', onKeydown);
			},
			removeKeydownListener: () => {
				window.removeEventListener('keydown', onKeydown);
			}
		}
	});

	const onKeydown = (e: KeyboardEvent) => {
		if (e.key !== 'Escape') {
			return;
		}
		close();
	};

	export const close = () => {
		send({ type: 'CLOSE' });
	};

	export const open = () => {
		send({ type: 'OPEN' });
	};

</script>

{#if $state.matches('open')}
	<div use:trapFocus class="fixed z-50 inset-0 px-50 pt-120" aria-modal="true" role="dialog" {id}>
		<div
			transition:fade={{ duration: 100 }}
			class="absolute inset-0 bg-white bg-opacity-50"
			on:click={close}
		/>
		<div
			in:fly={{ duration: 350, y: 150, easing: backOut }}
			out:fly={{ duration: 200, y: -60 }}
			class="relative z-10 flex flex-col space-y-110 p-70 rounded-10 bg-main shadow-2xl text-center"
		>
			<slot />
		</div>
	</div>
{/if}
