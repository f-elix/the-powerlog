<script>
  // Svelte
  import { createEventDispatcher, getContext } from "svelte";

  // js
  import {
    sessionNameQuery,
    sessionDateQuery
  } from "@/assets/js/session-queries.js";

  // Components
  import Select from "@/components/UI/Select.svelte";
  import Input from "@/components/UI/Input.svelte";

  const dispatch = createEventDispatcher();

  const { searchLogState, searchLogSend } = getContext("search");

  const selectOptions = ["session name", "time period", "date"];
  let selectedOption = selectOptions[0];

  function onNameFilterInput(e) {
    const value = e.target.value;
    const { query, queryName } = sessionNameQuery(value);
    searchLogSend({
      type: "NAME_INPUT",
      params: {
        value,
        query,
        queryName
      }
    });
  }

  function onDateFilterInput(e) {
    const value = e.target.value;
    const { query, queryName } = sessionDateQuery(value);
    searchLogSend({
      type: "DATE_INPUT",
      params: {
        value,
        query,
        queryName
      }
    });
  }

  function onTimePeriodFilterInput(e) {}

  // Time period form
  let fromDate;
  let toDate;
  let isDatesValid = false;
  let timePeriodError = null;
  $: isDatesValid = fromDate < toDate;
  $: if (fromDate && toDate) {
    if (isDatesValid) {
      timePeriodError = null;
      dispatch("timeperiodfilter", { fromDate, toDate });
    } else {
      timePeriodError = "The second date must be later than the first";
    }
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
        on:input={e => (fromDate = e.target.value)} />
      <Input
        type="date"
        label="to"
        name="to date"
        errorMessage={timePeriodError}
        on:input={e => (toDate = e.target.value)} />
      <!-- Date form -->
    {:else if selectedOption === 'date'}
      <Input type="date" label="date" name="date date" on:input={onDateFilterInput} />
    {/if}
  </form>
</section>
