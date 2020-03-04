<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  // Components
  import Select from "@/components/UI/Select.svelte";
  import Input from "@/components/UI/Input.svelte";

  const dispatch = createEventDispatcher();

  const selectOptions = ["session name", "time period", "date"];
  let selectedOption = selectOptions[0];
  let fromDate;
  let toDate;
  let isDatesValid = false;

  $: isDatesValid = fromDate < toDate;

  $: if (isDatesValid) {
    dispatch("timeperiodfilter", { fromDate, toDate });
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
    {#if selectedOption === 'session name'}
      <Input label="session name" name="session name" on:input />
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
        on:input={e => (toDate = e.target.value)} />
    {:else if selectedOption === 'date'}
      <Input type="date" label="date" name="date date" on:input />
    {/if}
  </form>
</section>
