<script>
  // Svelte
  import { createEventDispatcher, getContext } from "svelte";
  import { fly } from "svelte/transition";

  // FSM
  import { useMachine, useService } from "@/fsm/machineStores.js";
  import { filters } from "@/fsm/search/filterDisplayMachine.js";

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
  const { filterDisplayState, filterDisplaySend } = useService(
    $filterLogState.context.filterDisplay
  );

  let currentFilter;

  $: currentFilter = $filterDisplayState.context.currentFilter;
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

  function onFilterClick(filter) {
    filterDisplaySend({ type: "CHANGE", params: { filter } });
  }

  function onOutroEnd() {
    filterDisplaySend({ type: "TRANSITIONEND" });
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
    <div class="active-state" data-filter={currentFilter} />
    <button
      class:active={currentFilter === filters.name}
      on:click={() => onFilterClick(filters.name)}>
      Name
    </button>
    <button
      class:active={currentFilter === filters.date}
      on:click={() => onFilterClick(filters.date)}>
      Date
    </button>
    <button
      class:active={currentFilter === filters.period}
      on:click={() => onFilterClick(filters.period)}>
      Time Period
    </button>
  </div>
  <!-- Filter forms -->
  <form novalidate>
    <!-- Name form -->
    {#if $filterDisplayState.matches('idle') && currentFilter === filters.name}
      <div
        in:fly|local={{ x: 30, duration: 150 }}
        out:fly|local={{ x: -30, duration: 150 }}
        on:outroend={onOutroEnd}>
        <Input
          label="session name"
          name="session name"
          on:input={onNameFilterInput} />
      </div>
      <!-- Date form -->
    {:else if $filterDisplayState.matches('idle') && currentFilter === filters.date}
      <div
        in:fly|local={{ x: 30, duration: 150 }}
        out:fly|local={{ x: -30, duration: 150 }}
        on:outroend={onOutroEnd}>
        <Input
          type="date"
          label="date"
          name="date date"
          on:input={onDateFilterInput} />
      </div>
      <!-- Time period form -->
    {:else if $filterDisplayState.matches('idle') && currentFilter === filters.period}
      <div
        class="period-inputs-ctn"
        in:fly|local={{ x: 30, duration: 150 }}
        out:fly|local={{ x: -30, duration: 150 }}
        on:outroend={onOutroEnd}>
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
