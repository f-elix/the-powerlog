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

</style>

<main>
  {#if $authState.matches('authenticated')}
    <Header />
  {/if}
  <slot />
</main>
