<script>
  // Svelte
  import { onMount, setContext } from "svelte";

  //   FSM
  import { searchLogMachine } from "@/fsm/log/searchLogMachine.js";
  import { filterLogMachine } from "@/fsm/log/filterLogMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import CardSearchResult from "@/components/log/CardSearchResult.svelte";
  import ModuleSearchFilters from "@/components/log/ModuleSearchFilters.svelte";
  import Button from "@/components/UI/Button.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";

  const { searchLogState, searchLogSend } = useMachine(searchLogMachine);
  const { filterLogState, filterLogSend } = useMachine(filterLogMachine);

  setContext("filter", {
    filterLogState,
    filterLogSend
  });

  let filteredSessions = [];
  let loadedSessions = [];
  let sessions = [];
  let errorMessage = "No sessions found";
  let error = false;

  $: filteredSessions = $filterLogState.context.sessions;
  $: loadedSessions = $searchLogState.context.sessions;
  $: sessions = filteredSessions.length > 0 ? filteredSessions : loadedSessions;
  $: loadMoreError = !!$searchLogState.context.error;
  $: loadMoreErrorMessage =
    sessions.length > 0 ? "No more sessions found" : errorMessage;
  $: filterFetchError = !!$filterLogState.context.fetchError;

  function onLoadMore() {
    searchLogSend({ type: "LOAD_MORE" });
  }

  onMount(() => {
    onLoadMore();
  });
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

<ModuleSearchFilters />
<section class="sessions-ctn">
  <!-- SESSIONS -->
  {#if filterFetchError}
    <h3 class="error-message">{errorMessage}</h3>
  {:else if $filterLogState.matches('filtering')}
    <Spinner />
  {:else}
    {#each sessions as session, i (session._id)}
      <!-- Date title -->
      {#if !sessions[i - 1] || new Date(session.sessionDate).getMonth() !== new Date(sessions[i - 1].sessionDate).getMonth()}
        <h3>
          {new Date(session.sessionDate).toLocaleString('default', {
            month: 'long'
          })}
          {new Date(session.sessionDate).getFullYear()}
        </h3>
      {/if}
      <!-- Search results -->
      <CardSearchResult
        sessionName={session.title}
        sessionId={session._id}
        date={session.sessionDate} />
    {/each}
  {/if}
  <!-- LOAD MORE -->
  {#if sessions === loadedSessions && !filterFetchError}
    <div class="load-more-btn">
      {#if $searchLogState.matches('fetching')}
        <!-- Spinner -->
        <Spinner />
      {:else if $searchLogState.matches('idle') && !error}
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
