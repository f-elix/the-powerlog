<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  //FSM
  import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Select from "@/components/UI/Select.svelte";
  import EditFormModalLayout from "./EditFormModalLayout.svelte";

  const dispatch = createEventDispatcher();

  export let exerciseName;
  export let editedExecution;
  export let executionError = "";

  const options = {
    reps: "Reps",
    time: "Time",
    sec: "Sec",
    min: "Min",
    lbs: "Lbs",
    kg: "Kg"
  };

  const repsTimeOptions = [options.reps, options.time];
  const timeUnitOptions = [options.sec, options.min];
  const loadUnitOptions = [options.lbs, options.kg];

  let selectedRepsTime = options.reps;
  let selectedTimeUnit = options.sec;
  let selectedLoadUnit = options.lbs;

  let sets = "";
  let load = "";
  let repsTime = "";

  $: if (editedExecution) {
    selectedRepsTime = editedExecution.reps ? options.reps : options.time;
    selectedTimeUnit = editedExecution.time.unit
      ? editedExecution.time.unit
      : selectedTimeUnit;
    selectedLoadUnit = editedExecution.load.unit;

    sets = editedExecution.sets;
    load = editedExecution.load.amount;
    repsTime = editedExecution.reps
      ? editedExecution.reps
      : editedExecution.time.amount;
  }

  function onCancel() {
    dispatch("cancel");
  }

  function onDone() {
    const newExecution = {
      sets: +sets,
      load: +load,
      selectedLoadUnit
    };
    if (selectedRepsTime === "Time") {
      newExecution.time = +repsTime;
      newExecution.selectedTimeUnit = selectedTimeUnit;
    } else {
      newExecution.reps = +repsTime;
    }
    if (editedExecution) {
      newExecution._id = editedExecution._id;
    }
    dispatch("save", newExecution);
  }
</script>

<style>
  .input-group {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 1rem;
    padding-bottom: 2rem;
  }

  .input-group .reps-inputs,
  .input-group .load-inputs {
    display: grid;
    grid-gap: 1rem;
    align-items: baseline;
  }

  .input-group .sets-input {
    grid-column: 1 / 2;
  }

  .input-group .reps-inputs {
    grid-column: 2 / 3;
    grid-template-rows: 50% 1fr 1fr;
  }

  .input-group .load-inputs {
    grid-column: 3 / 4;
    grid-template-rows: 50% 1fr;
  }
</style>

<EditFormModalLayout on:cancel={onCancel} on:submit={onDone}>
  <h2>{exerciseName}</h2>
  <div class="input-group">
    <!-- Sets input -->
    <div class="sets-input">
      <Input
        type="number"
        label="Sets"
        name="sets"
        autofocus={true}
        errorMessage={executionError}
        value={sets}
        on:input={e => (sets = e.target.value)} />
    </div>
    <!-- Reps/time inputs -->
    <div class="reps-inputs">
      <Input
        type="number"
        label={selectedRepsTime}
        name="repsTime"
        value={repsTime}
        on:input={e => (repsTime = e.target.value)} />
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
      <Input
        label="Load"
        name="load"
        value={load}
        on:input={e => (load = e.target.value)} />
      <Select
        name="loadUnit"
        options={loadUnitOptions}
        bind:selected={selectedLoadUnit} />
    </div>
  </div>
</EditFormModalLayout>
