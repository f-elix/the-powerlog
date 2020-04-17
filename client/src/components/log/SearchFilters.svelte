<script>
  // Svelte
  import { createEventDispatcher, getContext } from "svelte";
  import { fly } from "svelte/transition";

  // FSM
  import { filterDisplayMachine } from "@/fsm/log/filterDisplayMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Select from "@/components/UI/Select.svelte";
  import Input from "@/components/UI/Input.svelte";

  const dispatch = createEventDispatcher();

  const { filterDisplayState, filterDisplaySend } = useMachine(
    filterDisplayMachine
  );
  const { logState } = getContext("log");

  $: timePeriodError = $logState.context.filterError;

  function onNameFilterInput(e) {
    dispatch("nameinput", e.target.value);
  }

  function onDateFilterInput(e) {
    dispatch("dateinput", e.target.value);
  }

  function onTimePeriodFilterFromInput(e) {
    dispatch("frominput", e.target.value);
  }

  function onTimePeriodFilterToInput(e) {
    dispatch("toinput", e.target.value);
  }

  function onSelectNameFilter() {
    filterDisplaySend({ type: "NAME_FILTER" });
  }

  function onSelectDateFilter() {
    filterDisplaySend({ type: "DATE_FILTER" });
  }

  function onSelectTimePeriodFilter() {
    filterDisplaySend({ type: "TIME_PERIOD_FILTER" });
  }

  function onOutroEnd() {
    filterDisplaySend({ type: "TRANSITIONEND" });
  }
</script>

<style>
  section {
    padding: 0 1rem;
    overflow-x: hidden;
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

  .active-state[data-filter*="name"] {
    transform: translateX(0);
  }
  .active-state[data-filter*="date"] {
    transform: translateX(100%);
  }
  .active-state[data-filter*="timeperiod"] {
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
      data-filter={$filterDisplayState.toStrings()[1]} />
    <button
      class:active={$filterDisplayState.matches('idle.name')}
      on:click={onSelectNameFilter}>
      Name
    </button>
    <button
      class:active={$filterDisplayState.matches('idle.date')}
      on:click={onSelectDateFilter}>
      Date
    </button>
    <button
      class:active={$filterDisplayState.matches('idle.timeperiod')}
      on:click={onSelectTimePeriodFilter}>
      Time Period
    </button>
  </div>
  <!-- Filter forms -->
  <form novalidate>
    <!-- Name form -->
    {#if $filterDisplayState.matches('idle.name')}
      <div
        in:fly|local={{ x: 30, duration: 150 }}
        out:fly|local={{ x: -30, duration: 150 }}
        on:outroend={onOutroEnd}>
        <Input
          label="session name"
          name="session name"
          on:input={onNameFilterInput} />
      </div>
    {/if}
    <!-- Date form -->
    {#if $filterDisplayState.matches('idle.date')}
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
    {/if}
    <!-- Time period form -->
    {#if $filterDisplayState.matches('idle.timeperiod')}
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
