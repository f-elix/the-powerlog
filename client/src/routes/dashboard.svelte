<script>
  // Svelte
  import { getContext, onMount } from "svelte";

  // FSM
  import { authMachine } from "@/fsm/auth/authMachine.js";
  import { searchMachine } from "@/fsm/search/searchMachine.js";
  import { useMachine } from "@/fsm/useMachine.js";

  // Utils
  import { currentWeekQuery, lastWeekQuery } from "@/assets/js/utils.js";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";
  import CardSearchResult from "@/components/log/CardSearchResult.svelte";
  import SearchForm from "@/components/log/SearchForm.svelte";

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
  .result-ctn {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    min-height: 12rem;
    padding: 1rem;
    background-color: var(--color-fg-light);
    overflow: hidden;
  }

  .switch-week-btn {
    display: flex;
    justify-content: flex-end;
    margin: 3rem 0;
  }

  .error-message {
    color: var(--color-primary-50);
    text-align: center;
  }
</style>

<section>
  <!-- Create button -->
  <Button size="fab" variant="filled" color="action">
    <i class="material-icons">add</i>
  </Button>
  <!-- Search ctn -->
  <div>
    <h1>{week.label} Week's Sessions</h1>
    <!-- Search results -->
    <div class="result-ctn">
      <!-- Spinner -->
      {#if $searchState.matches('fetching')}
        <Spinner />
      {/if}
      {#if $searchState.matches('success')}
        {#each currentWeekSessions as session (session._id)}
          <CardSearchResult
            sessionName={session.title}
            date={session.sessionDate} />
        {/each}
      {/if}
      {#if $searchState.matches('error')}
        <h2 class="error-message">{week.noResultMessage}</h2>
      {/if}
    </div>
    <div class="switch-week-btn">
      <Button color="info" on:click={toggleWeek}>{week.switchBtnLabel}</Button>
    </div>
  </div>
</section>

<section>
  <SearchForm />
</section>
