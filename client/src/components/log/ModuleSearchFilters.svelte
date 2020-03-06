<script>
  // Svelte
  import { createEventDispatcher, getContext } from "svelte";

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
    display: flex;
    flex-direction: column;
  }

  form {
    width: 100%;
    margin-top: 2rem;
  }
</style>

<section>
  <!-- Filter selection -->
  <Select
    bind:selected={selectedOption}
    options={selectOptions}
    label="Filter log by"
    name="filter-selection" />
  <!-- Filter forms -->
  <form novalidate>
    <!-- Name form -->
    {#if selectedOption === 'session name'}
      <Input
        label="session name"
        name="session name"
        on:input={onNameFilterInput} />
      <!-- Time period form -->
    {:else if selectedOption === 'time period'}
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
      <!-- Date form -->
    {:else if selectedOption === 'date'}
      <Input
        type="date"
        label="date"
        name="date date"
        on:input={onDateFilterInput} />
    {/if}
  </form>
</section>
