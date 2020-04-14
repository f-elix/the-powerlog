<script>
  // Svelte
  import { setContext } from "svelte";

  //   FSM
  import { logMachine } from "@/fsm/log/logMachine.js";
  import { filterLogMachine } from "@/fsm/log/filterLogMachine.js";
  import { useMachine, useService } from "@/fsm/machineStores.js";

  // Components
  import SessionsList from "@/components/log/SessionsList.svelte";
  import SearchFilters from "@/components/log/SearchFilters.svelte";
  import Button from "@/components/UI/Button.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";

  const { logState, logSend } = useMachine(logMachine);
  const { filterLogState, filterLogSend } = useMachine(filterLogMachine);
  const { filterDisplayState, filterDisplaySend } = useService(
    $filterLogState.context.filterDisplay
  );

  // $: console.log($filterLogState);

  setContext("filter", {
    filterLogState
  });

  setContext("filterDisplay", {
    filterDisplayState,
    filterDisplaySend
  });

  let error = false;

  $: filteredSessions = $filterLogState.context.sessions || [];
  $: filterFetchError = $filterLogState.context.fetchError;
  $: loadedSessions = $logState.context.sessions || [];
  $: loadMoreError = !!$logState.context.error;
  $: loadMoreErrorMessage = "No more sessions found";

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
  h3 {
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
<!-- SESSIONS -->
<section class="sessions-ctn">
  {#if $logState.matches('fetching') || $filterLogState.matches('filtering')}
    <Spinner />
  {/if}
  <!-- Filtered sessions -->
  {#if $filterLogState.matches('idle.fetch.error')}
    <h3 class="error-message">{filterFetchError}</h3>
  {/if}
  <!-- @TODO figure out no result state -->
  {#if $filterLogState.matches('idle.fetch.success')}
    <!-- {#if filteredSessions.length > 0} -->
    <SessionsList sessions={filteredSessions} />
    <!-- {:else}
      <h3>No sessions found</h3>
    {/if} -->
  {/if}
  <!-- Loaded sessions -->
  {#if $logState.matches('idle.normal') && $filterLogState.matches('idle.fetch.idle')}
    <SessionsList sessions={loadedSessions} />
    <div class="load-more-btn">
      <Button color="action" size="big" on:click={onLoadMore}>Load more</Button>
    </div>
  {/if}
  {#if $logState.matches('idle.error')}
    <h3>{loadMoreErrorMessage}</h3>
  {/if}
</section>
