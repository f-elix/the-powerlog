<script>
  // Svelte
  import { getContext, onMount } from "svelte";
  import { goto } from "@sapper/app";

  // FSM
  import { authMachine } from "@/fsm/auth/authMachine.js";
  import { logMachine } from "@/fsm/log/logMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // js
  import { currentWeekDates, lastWeekDates } from "@/assets/js/utils.js";
  import { sessionPeriodQuery } from "@/assets/js/session-queries.js";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import ModuleDashboardResults from "@/components/log/ModuleDashboardResults.svelte";

  const { authState, authSend } = getContext("auth");
  const { logState, logSend } = useMachine(logMachine);

  const { currentMonday, currentSunday } = currentWeekDates();
  const { lastMonday, lastSunday } = lastWeekDates();

  const currentWeek = {
    label: "This",
    noResultMessage: "No sessions logged yet this week",
    switchBtnLabel: "last week"
  };

  const lastWeek = {
    label: "Last",
    noResultMessage: "No sessions were logged last week",
    switchBtnLabel: "current week"
  };

  let week = currentWeek;

  function getCurrentWeek({ query, queryName }) {
    logSend({
      type: "SEARCH",
      params: {
        query,
        queryName
      }
    });
    week = currentWeek;
  }

  function getLastWeek({ query, queryName }) {
    logSend({
      type: "SEARCH",
      params: {
        query,
        queryName
      }
    });
    week = lastWeek;
  }

  function toggleWeek() {
    if (week === currentWeek) {
      getLastWeek(sessionPeriodQuery(lastMonday, lastSunday));
    } else {
      getCurrentWeek(sessionPeriodQuery(currentMonday, currentSunday));
    }
  }

  onMount(() => {
    getCurrentWeek(sessionPeriodQuery(currentMonday, currentSunday));
  });

  $: sessions = $logState.context.sessions;
  $: error = $logState.context.error.length > 0;
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
      <!-- <div> -->
      <Button color="info" on:click={toggleWeek}>{week.switchBtnLabel}</Button>
      <!-- </div> -->
    </div>
    <!-- Search results -->
    <ModuleDashboardResults
      isLoading={$logState.matches('fetching')}
      isSuccess={$logState.matches('idle')}
      isError={error}
      errorMessage={week.noResultMessage}
      {sessions} />
    <Button color="info" size="big" on:click={() => goto('/log')}>
      View full log
    </Button>
  </div>
</section>
