<script>
  // Svelte
  import { getContext } from "svelte";

  // FSM
  import { authMachine } from "@/fsm/auth/authMachine.js";
  import { useMachine } from "@/fsm/useMachine.js";

  // Components
  import Button from "@/components/UI/Button.svelte";

  const { authState, authSend } = getContext("auth");
</script>

<style>

</style>

<section>
  <Button
    variant="filled"
    color="primary-30"
    on:click={() => authSend({ type: 'LOGOUT' })}>
    Logout
  </Button>
  <h1>Dashboard</h1>
</section>
