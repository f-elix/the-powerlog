<script>
  // Svelte
  import { getContext, onMount } from "svelte";
  import { goto } from "@sapper/app";

  // FSM
  import { authMachine } from "@/fsm/auth/authMachine.js";
  import { searchMachine } from "@/fsm/search/searchMachine.js";
  import { useMachine } from "@/fsm/useMachine.js";

  // Utils
  import { currentWeekQuery, lastWeekQuery } from "@/assets/js/utils.js";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import ModuleSearchSessions from "@/components/log/ModuleSearchSessions.svelte";

  const { authState, authSend } = getContext("auth");
  const { searchState, searchSend } = useMachine(searchMachine);

  onMount(() => {
    searchSend({
      type: "SEARCH",
      params: {
        query: currentWeekQuery.query,
        queryName: currentWeekQuery.queryName
      }
    });
  });

  $: currentWeekSessions = $searchState.context.sessions;

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

  function toggleWeek() {
    if (week === currentWeek) {
      searchSend({
        type: "SEARCH",
        params: {
          query: lastWeekQuery.query,
          queryName: lastWeekQuery.queryName
        }
      });
      week = lastWeek;
    } else {
      searchSend({
        type: "SEARCH",
        params: {
          query: currentWeekQuery.query,
          queryName: currentWeekQuery.queryName
        }
      });
      week = currentWeek;
    }
  }
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
    <ModuleSearchSessions
      isLoading={$searchState.matches('fetching')}
      isSuccess={$searchState.matches('success')}
      isError={$searchState.matches('error')}
      errorMessage={week.noResultMessage}
      sessions={currentWeekSessions} />

    <Button color="info" size="big" on:click={() => goto('/log')}>
      View full log
    </Button>
  </div>
</section>
