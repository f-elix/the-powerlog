<script>
  // Svelte
  import { createEventDispatcher, getContext } from "svelte";
  import { fly } from "svelte/transition";

  // FSM
  import { useMachine } from "@/fsm/useMachine.js";
  import {
    filterDisplayMachine,
    filters
  } from "@/fsm/search/filterDisplayMachine.js";

  // js
  import {
    sessionNameQuery,
    sessionDateQuery,
    sessionPeriodQuery
  } from "@/assets/js/session-queries.js";

  // Components
  import Select from "@/components/UI/Select.svelte";
  import Input from "@/components/UI/Input.svelte";

  const { filterLogState, filterLogSend } = getContext("filter");
  const { filterDisplayState, filterDisplaySend } = useMachine(
    filterDisplayMachine
  );

  const dispatch = createEventDispatcher();

  const selectOptions = ["session name", "time period", "date"];
  let selectedOption = selectOptions[0];

  $: timePeriodError = $filterLogState.context.filterError;

  function onNameFilterInput(e) {
    const value = e.target.value;
    filterLogSend({
      type: "NAME_INPUT",
      params: {
        value
      }
    });
  }

  function onDateFilterInput(e) {
    const value = e.target.value;
    filterLogSend({
      type: "DATE_INPUT",
      params: {
        value
      }
    });
  }

  function onTimePeriodFilterFromInput(e) {
    const value = e.target.value;
    filterLogSend({
      type: "PERIOD_INPUT",
      params: {
        value: {
          from: value
        }
      }
    });
  }

  function onTimePeriodFilterToInput(e) {
    const value = e.target.value;
    filterLogSend({
      type: "PERIOD_INPUT",
      params: {
        value: {
          to: value
        }
      }
    });
  }
</script>

<style>
  section {
    padding: 3rem 1rem;
  }

  .btn-ctn {
    --active-state-width: calc(100% / 3);
    --active-state-transition: 0.15s cubic-bezier(0.7, 0, 0.3, 1);
    position: relative;
    display: flex;
    justify-content: space-between;
    border: var(--border-default) var(--color-primary);
  }

  .btn-ctn button {
    width: calc(100% / 3);
    padding: 1rem 0;
    border: var(--border-thin) var(--color-primary);
    background: none;
    color: var(--color-primary);
    outline: none;
    cursor: pointer;
    transition: color var(--active-state-transition);
  }

  .btn-ctn button.active {
    color: var(--color-bg);
  }

  .active-state {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: var(--active-state-width);
    height: 100%;
    background-color: var(--color-primary);
    transition: transform var(--active-state-transition);
  }

  .active-state[data-filter="name"] {
    transform: translateX(0);
  }
  .active-state[data-filter="date"] {
    transform: translateX(100%);
  }
  .active-state[data-filter="period"] {
    transform: translateX(200%);
  }

  form {
    width: 100%;
    margin-top: 2rem;
  }

  .period-inputs-ctn {
    display: flex;
    justify-content: space-between;
  }

  :global(.period-inputs-ctn > div) {
    width: 45%;
  }
</style>

<section>
  <!-- Filter tab selection -->
  <h2>Filter log by</h2>
  <div class="btn-ctn">
    <div
      class="active-state"
      data-filter={$filterDisplayState.context.currentFilter} />
    <button
      class:active={$filterDisplayState.context.currentFilter === filters.name}
      on:click={() => filterDisplaySend({
          type: 'CHANGE',
          params: { filter: filters.name }
        })}>
      Name
    </button>
    <button
      class:active={$filterDisplayState.context.currentFilter === filters.date}
      on:click={() => filterDisplaySend({
          type: 'CHANGE',
          params: { filter: filters.date }
        })}>
      Date
    </button>
    <button
      class:active={$filterDisplayState.context.currentFilter === filters.period}
      on:click={() => filterDisplaySend({
          type: 'CHANGE',
          params: { filter: filters.period }
        })}>
      Time Period
    </button>
  </div>
  <!-- Filter forms -->
  <form novalidate>
    <!-- Name form -->
    {#if $filterDisplayState.matches('idle') && $filterDisplayState.context.currentFilter === filters.name}
      <div
        in:fly={{ x: 30, duration: 150 }}
        out:fly={{ x: -30, duration: 150 }}
        on:outroend={() => filterDisplaySend({ type: 'TRANSITIONEND' })}>
        <Input
          label="session name"
          name="session name"
          on:input={onNameFilterInput} />
      </div>
    {:else if $filterDisplayState.matches('idle') && $filterDisplayState.context.currentFilter === filters.date}
      <!-- Date form -->
      <div
        in:fly={{ x: 30, duration: 150 }}
        out:fly={{ x: -30, duration: 150 }}
        on:outroend={() => filterDisplaySend({ type: 'TRANSITIONEND' })}>
        <Input
          type="date"
          label="date"
          name="date date"
          on:input={onDateFilterInput} />
      </div>
      <!-- Time period form -->
    {:else if $filterDisplayState.matches('idle') && $filterDisplayState.context.currentFilter === filters.period}
      <div
        class="period-inputs-ctn"
        in:fly={{ x: 30, duration: 150 }}
        out:fly={{ x: -30, duration: 150 }}
        on:outroend={() => filterDisplaySend({ type: 'TRANSITIONEND' })}>
        <Input
          type="date"
          label="from"
          name="from date"
          on:input={onTimePeriodFilterFromInput} />
        <Input
          type="date"
          label="to"
          name="to date"
          errorMessage={timePeriodError}
          on:input={onTimePeriodFilterToInput} />
      </div>
    {/if}
  </form>
</section>
