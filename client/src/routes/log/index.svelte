<script>
  // Svelte
  import { onMount, setContext } from "svelte";

  //   FSM
  import { logMachine } from "@/fsm/log/logMachine.js";
  import { filterLogMachine } from "@/fsm/log/filterLogMachine.js";
  import { useMachine, useService } from "@/fsm/machineStores.js";

  // Components
  import CardSearchResult from "@/components/log/CardSearchResult.svelte";
  import SearchFilters from "@/components/log/SearchFilters.svelte";
  import Button from "@/components/UI/Button.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";

  const { logState, logSend } = useMachine(logMachine);
  const { filterLogState, filterLogSend } = useMachine(filterLogMachine);
  const { filterDisplayState, filterDisplaySend } = useService(
    $filterLogState.context.filterDisplay
  );

  setContext("filter", {
    filterLogState
  });

  setContext("filterDisplay", {
    filterDisplayState,
    filterDisplaySend
  });

  onMount(() => {
    onLoadMore();
  });

  let filteredSessions = [];
  let loadedSessions = [];
  let sessions = [];
  let errorMessage = "No sessions found";
  let error = false;

  $: filteredSessions = $filterLogState.context.sessions;
  $: loadedSessions = $logState.context.sessions;
  $: sessions = filteredSessions.length > 0 ? filteredSessions : loadedSessions;
  $: loadMoreError = !!$logState.context.error;
  $: loadMoreErrorMessage =
    sessions.length > 0 ? "No more sessions found" : errorMessage;
  $: filterFetchError = !!$filterLogState.context.fetchError;

  function onLoadMore() {
    logSend({ type: "LOAD_MORE" });
  }

  function onNameInput(e) {
    filterLogSend({
      type: "NAME_INPUT",
      params: {
        value: e.detail
      }
    });
  }

  function onDateInput(e) {
    filterLogSend({
      type: "DATE_INPUT",
      params: {
        value: e.detail
      }
    });
  }

  function onFromInput(e) {
    filterLogSend({
      type: "PERIOD_INPUT",
      params: {
        value: {
          from: e.detail
        }
      }
    });
  }

  function onToInput(e) {
    filterLogSend({
      type: "PERIOD_INPUT",
      params: {
        value: {
          to: e.detail
        }
      }
    });
  }
</script>

<style>
  .sessions-ctn .error-message {
    text-align: center;
  }

  .load-more-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem auto 12rem;
  }
</style>

<h1>Your Log History</h1>
<SearchFilters
  on:nameinput={onNameInput}
  on:dateinput={onDateInput}
  on:frominput={onFromInput}
  on:toinput={onToInput} />
<section class="sessions-ctn">
  <!-- SESSIONS -->
  {#if filterFetchError}
    <h3 class="error-message">{errorMessage}</h3>
  {:else if $filterLogState.matches('filtering')}
    <Spinner />
  {:else}
    {#each sessions as session, i (session._id)}
      <!-- Date title -->
      {#if !sessions[i - 1] || new Date(session.date).getMonth() !== new Date(sessions[i - 1].date).getMonth()}
        <h3>
          {new Date(session.date).toLocaleString('default', { month: 'long' })}
          {new Date(session.date).getFullYear()}
        </h3>
      {/if}
      <!-- Search results -->
      <CardSearchResult
        sessionName={session.title}
        sessionId={session._id}
        date={session.date} />
    {/each}
  {/if}
  <!-- LOAD MORE -->
  {#if sessions === loadedSessions && !filterFetchError}
    <div class="load-more-btn">
      {#if $logState.matches('fetching')}
        <!-- Spinner -->
        <Spinner />
      {:else if $logState.matches('idle') && !error}
        <!-- Load more btn -->
        <Button color="action" size="big" on:click={onLoadMore}>
          Load more
        </Button>
      {:else if loadMoreError}
        <!-- Error message -->
        <h3>{loadMoreErrorMessage}</h3>
      {/if}
    </div>
  {/if}
</section>
