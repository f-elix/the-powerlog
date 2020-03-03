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

  const noResultMessage = "No sessions found";

  let sessions = $searchLogState.context.sessions;

  console.log($searchLogState.context)

  // $: sessions = [sessions, ...$searchLogState.context.sessions];

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
</script>

<style>
  .load-more-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem auto;
  }
</style>

<ModuleSearchFilters />
{#each sessions as session (session._id)}
<CardSearchResult />
{/each}
<div class="load-more-btn">
  {#if $searchLogState.matches('fetching')}
  <Spinner />
  {:else}
  <Button color="action" on:click={onLoadMore}>Load more</Button>
  {/if}
</div>
