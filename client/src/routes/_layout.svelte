<script>
  // Svelte
  import { setContext } from "svelte";

  // FSM
  import { useMachine } from "@/fsm/useMachine.js";
  import { authMachine } from "@/fsm/auth/authMachine.js";

  // Components
  import Header from "@/components/layout/Header.svelte";

  const { authState, authSend } = useMachine(authMachine);

  setContext("auth", {
    authState,
    authSend
  });
</script>

<style>
  .header-padding {
    padding-top: var(--header-height);
  }
</style>

<main class:header-padding={$authState.matches('authenticated')}>
  {#if $authState.matches('authenticated')}
    <Header />
  {/if}
  <slot />
</main>
