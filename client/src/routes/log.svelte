<script>
  // Svelte
  import { onMount, setContext } from "svelte";

  //   FSM
  import { searchLogMachine } from "@/fsm/search/searchLogMachine.js";
  import { useMachine } from "@/fsm/useMachine.js";

  // js
  import { sessionRangeQuery } from "@/assets/js/session-queries.js";

  // Components
  import CardSearchResult from "@/components/log/CardSearchResult.svelte";
  import ModuleSearchFilters from "@/components/log/ModuleSearchFilters.svelte";
  import Button from "@/components/UI/Button.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";

  const { searchLogState, searchLogSend } = useMachine(searchLogMachine);

  setContext("search", {
    searchLogState,
    searchLogSend
  });

  const range = 10;

  let sessionRange = {
    from: 1,
    to: range
  };

  let sessions = [];

  $: sessions = $searchLogState.context.sessions;
  $: filteredSessions = $searchLogState.context.filteredSessions;

  $: displayedSessions = filteredSessions ? filteredSessions : sessions;

  let errorMessage = "No sessions found";

  $: if ($searchLogState.matches("error")) {
    errorMessage = $searchLogState.context.error;
  }

  $: errorMessage =
    sessions.length > 0 ? "No more sessions found" : errorMessage;

  function onLoadMore() {
    sessionRange = {
      from: sessionRange.from + range,
      to: sessionRange.to + range
    };
    const { query, queryName } = sessionRangeQuery(
      sessionRange.from,
      sessionRange.to
    );
    searchLogSend({
      type: "LOAD_MORE",
      params: {
        query,
        queryName
      }
    });
  }

  onMount(() => {
    const { query, queryName } = sessionRangeQuery(
      sessionRange.from,
      sessionRange.to
    );
    searchLogSend({
      type: "SEARCH",
      params: {
        query,
        queryName
      }
    });
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
  {#each displayedSessions as session, i (session._id)}
    <!-- Date title -->
    {#if !displayedSessions[i - 1] || new Date(session.sessionDate).getMonth() !== new Date(displayedSessions[i - 1].sessionDate).getMonth()}
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
    {:else if $searchLogState.matches('idle')}
      <!-- Load more btn -->
      <Button color="action" size="big" on:click={onLoadMore}>Load more</Button>
    {:else if errorMessage}
      <!-- Error message -->
      <h3>{errorMessage}</h3>
    {/if}
  </div>
</section>
