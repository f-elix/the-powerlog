<script>
  // Svelte
  import { getContext, onMount } from "svelte";
  import { goto } from "@sapper/app";

  // FSM
  import { authMachine } from "@/fsm/auth/authMachine.js";
  import { logMachine } from "@/fsm/log/logMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import DashboardResults from "@/components/log/DashboardResults.svelte";

  const { authState, authSend } = getContext("auth");
  const { logState, logSend } = useMachine(logMachine);

  const currentWeek = {
    label: "This",
    switchBtnLabel: "last week"
  };

  const lastWeek = {
    label: "Last",
    switchBtnLabel: "current week"
  };

  let week = currentWeek;
  $: sessions = $logState.context.sessions;

  function getCurrentWeek() {
    logSend({ type: "LOAD_CURRENT_WEEK" });
    week = currentWeek;
  }

  function getLastWeek() {
    logSend({ type: "LOAD_LAST_WEEK" });
    week = lastWeek;
  }

  function toggleWeek() {
    if (week === currentWeek) {
      getLastWeek();
    } else {
      getCurrentWeek();
    }
  }

  onMount(() => {
    getCurrentWeek();
  });
</script>

<style>
  .heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 3rem;
  }

  .heading h1 {
    margin: 0;
  }
</style>

<section>
  <!-- Sessions ctn -->
  <div>
    <div class="heading">
      <h1>{week.label} Week's Sessions</h1>
      <Button color="info" on:click={toggleWeek}>{week.switchBtnLabel}</Button>
    </div>
    <!-- Search results -->
    <DashboardResults
      isLoading={$logState.matches('fetching')}
      isSuccess={$logState.matches('idle.fetch.success')}
      isError={$logState.matches('idle.fetch.error')}
      errorMessage={$logState.context.fetchError}
      {sessions} />
    <Button color="info" size="big" on:click={() => goto('/log')}>
      View full log
    </Button>
  </div>
</section>
