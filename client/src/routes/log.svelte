<script>
  // Svelte
  import { onMount, setContext } from "svelte";

  //   FSM
  import { searchLogMachine } from "@/fsm/search/searchLogMachine.js";
  import { filterLogMachine } from "@/fsm/search/filterLogMachine.js";
  import { useMachine } from "@/fsm/useMachine.js";

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

  // @TODO show error if no filtered sessions and filter applied

  $: filteredSessions = $filterLogState.context.sessions;
  $: loadedSessions = $searchLogState.context.sessions;
  $: sessions = filteredSessions.length > 0 ? filteredSessions : loadedSessions;
  $: error = !!$searchLogState.context.error;
  $: errorMessage =
    sessions.length > 0 ? "No more sessions found" : errorMessage;

  function onLoadMore() {
    searchLogSend({ type: "LOAD_MORE" });
  }

  onMount(() => {
    onLoadMore();
  });
</script>

<style>
  .load-more-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem auto 12rem;
  }
</style>

<ModuleSearchFilters />
<section>
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
  <div class="load-more-btn">
    {#if $searchLogState.matches('fetching')}
      <!-- Spinner -->
      <Spinner />
    {:else if $searchLogState.matches('idle') && !error}
      <!-- Load more btn -->
      <Button color="action" size="big" on:click={onLoadMore}>Load more</Button>
    {:else if errorMessage}
      <!-- Error message -->
      <h3>{errorMessage}</h3>
    {/if}
  </div>
</section>
