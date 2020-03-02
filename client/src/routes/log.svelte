<script>
  // Svelte
  import { onMount } from "svelte";

  //   FSM
  import { authMachine } from "@/fsm/auth/authMachine.js";
  import { searchLogMachine } from "@/fsm/search/searchLogMachine.js";
  import { useMachine } from "@/fsm/useMachine.js";

  // Utils
  import { sessionRangeQuery } from "@/assets/js/session-queries.js";

  // Components
  import CardSearchResult from "@/components/log/CardSearchResult.svelte";
  import ModuleSearchFilters from "@/components/log/ModuleSearchFilters.svelte";
  import Button from "@/components/UI/Button.svelte";

  const { searchLogState, searchLogSend } = useMachine(searchLogMachine);

  const range = 10;

  let sessionRange = {
    from: 1,
    to: range
  };

  const noResultMessage = "No sessions found";

  let sessions = [];

  $: sessions = [sessions, ...$searchLogState.context.sessions];

  onMount(() => {
    const { query, queryName } = sessionRangeQuery(
      sessionRange.from,
      sessionRange.to
    );
    searchSend({
      type: "SEARCH",
      params: {
        query,
        queryName
      }
    });
  });

  function onLoadMore() {
    sessionRange = {
      from: sessionRange.from + range,
      to: sessionRange.to + range
    };
    const { query, queryName } = sessionRangeQuery(
      sessionRange.from,
      sessionRange.to
    );
    searchSend({
      type: "SEARCH",
      params: {
        query,
        queryName
      }
    });
  }
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
  <Button color="action" on:click={onLoadMore}>Load more</Button>
</div>
