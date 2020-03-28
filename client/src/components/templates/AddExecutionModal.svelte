<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  //FSM
  import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Select from "@/components/UI/Select.svelte";
  import EditFormLayout from "./EditFormLayout.svelte";

  const dispatch = createEventDispatcher();

  export let exerciseName;

  const repsTimeOptions = ["Reps", "Time"];
  const timeUnitOptions = ["Sec", "Min"];
  const loadUnitOptions = ["Lbs", "Kg"];

  let selectedRepsTime = "Reps";
  let selectedTimeUnit = "Sec";
  let selectedLoadUnit = "Lbs";

  let sets = 0;
  let reps = 0;
  let time = 0;
  let load = 0;

  function onCancel() {
    dispatch("cancel");
  }

  function onDone() {
    const newExecution = {
      sets,
      reps,
      time,
      load,
      selectedLoadUnit,
      selectedTimeUnit
    };
    dispatch("save", newExecution);
  }
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

<EditFormLayout on:cancel={onCancel} on:submit={onDone}>
  <h2>{exerciseName}</h2>
  <div class="input-group">
    <!-- Sets input -->
    <Input
      type="number"
      label="Sets"
      name="sets"
      autofocus={true}
      on:input={e => (sets = e.target.value)} />
    <!-- Reps/time inputs -->
    <div class="reps-inputs">
      <Input
        type="number"
        label={selectedRepsTime}
        name="repsTime"
        on:input={e => (selectedRepsTime === 'Reps' ? (reps = e.target.value) : (time = e.target.value))} />
      <Select
        name="repsTime"
        options={repsTimeOptions}
        bind:selected={selectedRepsTime} />
      {#if selectedRepsTime === 'Time'}
        <Select
          name="timeUnit"
          options={timeUnitOptions}
          bind:selected={selectedTimeUnit} />
      {/if}
    </div>
    <!-- Load inputs -->
    <div class="load-inputs">
      <Input label="Load" name="load" on:input={e => (load = e.target.value)} />
      <Select
        name="loadUnit"
        options={loadUnitOptions}
        bind:selected={selectedLoadUnit} />
    </div>
  </div>
</EditFormLayout>
