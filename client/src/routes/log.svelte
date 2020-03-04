<script>
  // Svelte
  import { onMount } from "svelte";

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

  const range = 10;

  let sessionRange = {
    from: 1,
    to: range
  };

  let sessions = [];

  let errorMessage = "No sessions found";

  $: if ($searchLogState.matches("success")) {
    sessions = [...sessions, ...$searchLogState.context.sessions];
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
      type: "SEARCH",
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
  /* @TODO
    Load 20 last sessions, then load more with a button
    Load server filtered sessions when filter is applied
    Apply filter as user types, debouncing with Xstate
  */
  function onTimePeriodFilterInput() {}
  function onFilterInput() {}
</script>

<style>
  .load-more-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem auto 12rem;
  }
</style>

<ModuleSearchFilters
  on:timeperiodfilter={onTimePeriodFilterInput}
  on:input={onFilterInput} />
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
    {:else if $searchLogState.matches('success')}
      <!-- Load more btn -->
      <Button color="action" size="big" on:click={onLoadMore}>Load more</Button>
    {:else if $searchLogState.matches('error')}
      <!-- Error message -->
      <h3>{errorMessage}</h3>
    {/if}
  </div>
</section>
