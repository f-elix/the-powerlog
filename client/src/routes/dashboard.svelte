<script>
  // Svelte
  import { getContext, onMount } from "svelte";
  import { goto } from "@sapper/app";

  // FSM
  import { authMachine } from "@/fsm/auth/authMachine.js";
  import { searchLogMachine } from "@/fsm/search/searchLogMachine.js";
  import { useMachine } from "@/fsm/useMachine.js";

  // js
  import { currentWeekDates, lastWeekDates } from "@/assets/js/utils.js";
  import {
    currentWeekQuery,
    lastWeekQuery
  } from "@/assets/js/session-queries.js";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import ModuleDashboardResults from "@/components/log/ModuleDashboardResults.svelte";

  const { authState, authSend } = getContext("auth");
  const { searchLogState, searchLogSend } = useMachine(searchLogMachine);

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
    searchLogSend({
      type: "SEARCH",
      params: {
        query,
        queryName
      }
    });
    week = currentWeek;
  }

  function getLastWeek({ query, queryName }) {
    searchLogSend({
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
      getLastWeek(lastWeekQuery(lastMonday, lastSunday));
    } else {
      getCurrentWeek(currentWeekQuery(currentMonday, currentSunday));
    }
  }

  onMount(() => {
    getCurrentWeek(currentWeekQuery(currentMonday, currentSunday));
  });

  $: console.log($searchLogState.context)

  $: sessions = $searchLogState.context.sessions;
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
  <!-- Create button -->
  <Button size="fab" variant="filled" color="action">
    <i class="material-icons">add</i>
  </Button>
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
      isLoading={$searchLogState.matches('fetching')}
      isSuccess={$searchLogState.matches('success')}
      isError={$searchLogState.matches('error')}
      errorMessage={week.noResultMessage}
      {sessions} />
    <Button color="info" size="big" on:click={() => goto('/log')}>
      View full log
    </Button>
  </div>
</section>
