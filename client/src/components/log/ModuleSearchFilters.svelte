<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  // Components
  import Select from "@/components/UI/Select.svelte";
  import Input from "@/components/UI/Input.svelte";

  const dispatch = createEventDispatcher();

  const selectOptions = ["session name", "time period", "date"];
  let selectedOption = selectOptions[0];

  // Session name form
  function onNameInput(e) {
    dispatch('namefilterinput', e.target.value)
  }

  // Date form
  function onDateInput(e) {
    dispatch('datefilterinput', e.target.value)
  }

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
      timePeriodError = 'The second date must be later than the first';
    }
  }
</script>

<style>
  section {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
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
      <Input label="session name" name="session name" on:input={onNameInput} />
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
      <Input type="date" label="date" name="date date" on:input={onDateInput} />
    {/if}
  </form>
</section>
