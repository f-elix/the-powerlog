<script lang="ts">
	import Modal from 'src/components/Modal.svelte';
	import SignupForm from 'src/components/SignupForm.svelte';
	import Button from 'coms/Button.svelte';
	import { ui } from 'src/ui';

	let modal: Modal;
	let isModalOpen = false;

	const onSignUp = () => modal.open();

	const onClose = () => modal.close();

</script>

<Button theme="info" variant="outlined" expanded={isModalOpen} on:click={onSignUp}
	>{ui.createAccount}</Button
>

<Modal id="signup" bind:this={modal} bind:isOpen={isModalOpen}>
	<button aria-expanded={isModalOpen} class="_focus-default" on:click={onClose}>Close</button>
	<SignupForm />
</Modal>
