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
  <Button size="fab" variant="filled" color="action">
    <i class="material-icons">add</i>
  </Button>
  <div class="result-ctn">
    <h1>This Week's Sessions</h1>
    <CardSearchResult sessionName="Squat" date="2020-02-02" />
    <CardSearchResult sessionName="Squat" date="2020-02-02" />
    <CardSearchResult sessionName="Squat" date="2020-02-02" />
    <CardSearchResult sessionName="Squat" date="2020-02-02" />
    <Button size="big" color="info">View Last Week</Button>
  </div>
</section>
