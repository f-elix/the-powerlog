<script>
  // Svelte
  import { setContext } from "svelte";

  // FSM
  import { useMachine } from "@/fsm/machineStores.js";
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
  main {
    padding-bottom: calc(var(--header-height) + 2rem);
  }
</style>

<main>
  {#if $authState.matches('authenticated')}
    <Header />
  {/if}
  <slot />
</main>
