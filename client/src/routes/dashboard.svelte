<script>
  // Svelte
  import { getContext, onMount } from "svelte";

  // FSM
  import { authMachine } from "@/fsm/auth/authMachine.js";
  import { useMachine } from "@/fsm/useMachine.js";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import CardSearchResult from "@/components/log/CardSearchResult.svelte";

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
  <h1>{$authState.context.userData.name}'s log</h1>
  <div class="result-ctn">
    <CardSearchResult sessionName="Squat" date="2020-02-02" />
    <CardSearchResult sessionName="Squat" date="2020-02-02" />
    <CardSearchResult sessionName="Squat" date="2020-02-02" />
    <CardSearchResult sessionName="Squat" date="2020-02-02" />
    <CardSearchResult sessionName="Squat" date="2020-02-02" />
  </div>
</section>
