<script>
  // Svelte
  import { getContext, onMount } from "svelte";

  //FSM
  import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Select from "@/components/UI/Select.svelte";
  import EditFormLayout from "./EditFormLayout.svelte";

  let repsTimeSelectedOption = "Reps";
</script>

<style>
  .input-group {
    --first-column-width: 30%;
    display: grid;
    grid-template-columns: var(--first-column-width) 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    grid-column-gap: 10%;
    grid-row-gap: 2rem;
    align-items: baseline;
    margin: 2rem auto;
  }

  .input-group .reps-inputs,
  .input-group .load-inputs {
    grid-column: 1 / 4;
    display: grid;
    grid-gap: 1rem;
    align-items: baseline;
  }

  .input-group .reps-inputs {
    grid-row: 2 / 3;
    grid-template-columns: var(--first-column-width) 1fr 1fr;
  }

  .input-group .load-inputs {
    grid-row: 3 / 4;
    grid-template-columns: var(--first-column-width) 1fr;
  }
</style>

<EditFormLayout>
  <h2>Add Set</h2>
  <div class="input-group">
    <!-- Sets input -->
    <Input type="number" label="Sets" name="sets" />
    <!-- Reps/time inputs -->
    <div class="reps-inputs">
      <Input type="number" label={repsTimeSelectedOption} name="repsTime" />
      <Select
        name="repsTime"
        options={['Reps', 'Time']}
        bind:selected={repsTimeSelectedOption} />
      {#if repsTimeSelectedOption === 'Time'}
        <Select name="timeUnit" options={['Sec', 'Min']} />
      {/if}
    </div>
    <!-- Load inputs -->
    <div class="load-inputs">
      <Input label="Load" name="load" />
      <Select name="loadUnit" options={['Lbs', 'Kg']} />
    </div>
  </div>
</EditFormLayout>
