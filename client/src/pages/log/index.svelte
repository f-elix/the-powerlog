<script>
  // Svelte
  import { onMount, setContext, getContext } from "svelte";
  import { fly } from "svelte/transition";
  import { goto } from "@sveltech/routify";

  //   FSM
  import { logMachine } from "@/fsm/log/logMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import SessionsList from "@/components/log/SessionsList.svelte";
  import SearchFilters from "@/components/log/SearchFilters.svelte";
  import Button from "@/components/UI/Button.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";

  const pageTransition = getContext("page-transition");

  const { logState, logSend } = useMachine(logMachine);

  setContext("log", {
    logState
  });

  $: sessions = $logState.context.sessions;
  $: fetchError = $logState.context.fetchError;

  onMount(() => {
    logSend({ type: "LOAD" });
  });

  function onLoadMore() {
    logSend({ type: "LOAD_MORE" });
  }

  function onNameInput(e) {
    logSend({
      type: "NAME_INPUT",
      params: {
        value: e.detail
      }
    });
  }

  function onDateInput(e) {
    logSend({
      type: "DATE_INPUT",
      params: {
        value: e.detail
      }
    });
  }

  function onFromInput(e) {
    logSend({
      type: "PERIOD_INPUT",
      params: {
        value: {
          from: e.detail
        }
      }
    });
  }

  function onToInput(e) {
    logSend({
      type: "PERIOD_INPUT",
      params: {
        value: {
          to: e.detail
        }
      }
    });
  }

  function onDelete(e) {
    logSend({
      type: "DELETE",
      params: {
        workoutId: e.detail
      }
    });
  }
</script>

<style>
  h3 {
    text-align: center;
  }

  .sessions-ctn {
    padding-top: 2rem;
  }

  .load-more-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem auto 12rem;
  }
</style>

<div in:fly={pageTransition}>
  <section>
    <h1>Your Log History</h1>
    <SearchFilters
      on:nameinput={onNameInput}
      on:dateinput={onDateInput}
      on:frominput={onFromInput}
      on:toinput={onToInput} />
  </section>
  <!-- SESSIONS -->
  <section class="sessions-ctn">
    <!-- Add button -->
    <Button
      size="big"
      variant="filled"
      color="action"
      on:click={() => $goto('/log/new')}>
      <i class="material-icons">add</i>
      Add new
    </Button>
    <!-- Sessions -->
    {#if $logState.matches('idle.fetch.success') || $logState.matches('fetching.loadmore')}
      <SessionsList {sessions} on:delete={onDelete} />
      {#if sessions.length >= $logState.context.range}
        <div class="load-more-btn">
          <Button color="action" size="big" on:click={onLoadMore}>
            Load more
          </Button>
        </div>
      {/if}
    {/if}
    {#if $logState.matches('idle.fetch.empty')}
      <SessionsList {sessions} on:delete={onDelete} />
      <h3>{fetchError}</h3>
    {/if}
    {#if $logState.matches('idle.fetch.filtering')}
      <SessionsList {sessions} on:delete={onDelete} />
    {/if}
    {#if $logState.matches('idle.fetch.error')}
      <h3>{fetchError}</h3>
    {/if}
    {#if $logState.matches('fetching')}
      <Spinner />
    {/if}
  </section>
</div>
