<script>
  // Svelte
  import { getContext } from 'svelte';

  //FSM
  import { exercisesMachine } from '@/fsm/exercises/exercisesMachine.js';
  import { useMachine } from '@/fsm/machineStores.js';

  // Components
  import Input from '@/components/UI/Input.svelte';
  import Select from '@/components/UI/Select.svelte';
  import EditFormModalLayout from './EditFormModalLayout.svelte';

  const { editWorkoutState, editWorkoutSend } = getContext('editWorkout');

  let exerciseName =
    $editWorkoutState.context.editedExercise.state.context.movement.exercise
      .name;
  let editedExecution =
    $editWorkoutState.context.editedExercise.state.context.execution;
  let executionError = $editWorkoutState.context.editedExercise
    ? $editWorkoutState.context.editedExercise.state.context.executionError
    : '';

  const options = {
    reps: 'Reps',
    time: 'Time',
    sec: 'Sec',
    min: 'Min',
    lbs: 'Lbs',
    kg: 'Kg'
  };

  let selectedRepsTime = options.reps;
  let selectedTimeUnit = options.sec;
  let selectedLoadUnit = options.lbs;

  let sets = '';
  let load = '';
  let repsTime = '';

  $: if (editedExecution) {
    selectedRepsTime = editedExecution.reps ? options.reps : options.time;
    selectedTimeUnit = editedExecution.time.unit;
    selectedLoadUnit = editedExecution.load.unit;

    sets = editedExecution.sets;
    load = editedExecution.load.amount;
    repsTime = editedExecution.reps
      ? editedExecution.reps
      : editedExecution.time.amount;
  }

  function onCancel() {
    editWorkoutSend({ type: 'CANCEL' });
  }

  function onDone() {
    const newExecution = {
      sets: +sets,
      load: +load,
      selectedLoadUnit
    };
    if (selectedRepsTime === 'Time') {
      newExecution.time = +repsTime;
      newExecution.selectedTimeUnit = selectedTimeUnit;
    } else {
      newExecution.reps = +repsTime;
    }
    if (editedExecution) {
      newExecution._id = editedExecution._id;
    }
    editWorkoutSend({
      type: 'SAVE_EXECUTION',
      params: {
        executionData: newExecution
      }
    });
  }
</script>

<style>
  .input-group {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 6rem 4rem 4rem;
    grid-column-gap: 1rem;
    grid-auto-flow: column;
    padding-bottom: 2rem;
  }

  .radio {
    display: flex;
    align-items: center;
    font-size: var(--text-normal);
  }

  .radio input {
    margin: 0;
    margin-right: 1rem;
  }

  .radio.disabled {
    opacity: 0.5;
  }
</style>

<EditFormModalLayout on:cancel={onCancel} on:submit={onDone}>
  <h2>{exerciseName}</h2>
  <div class="input-group">
    <!-- Sets input -->
    <Input
      type="number"
      label="Sets"
      name="sets"
      autofocus={true}
      errorMessage={executionError}
      value={sets}
      on:input={e => (sets = e.target.value)} />
    <!-- Selected reps / time -->
    <label class="radio">
      <input
        type="radio"
        name={options.reps}
        value={options.reps}
        bind:group={selectedRepsTime} />
      {options.reps}
    </label>
    <label class="radio">
      <input
        type="radio"
        name={options.time}
        value={options.time}
        bind:group={selectedRepsTime} />
      {options.time}
    </label>
    <!-- Reps/time inputs -->
    <Input
      type="number"
      label={selectedRepsTime}
      name="repsTime"
      value={repsTime}
      on:input={e => (repsTime = e.target.value)} />
    <!-- Selected time unit -->
    <label class="radio" class:disabled={selectedRepsTime !== options.time}>
      <input
        disabled={selectedRepsTime !== options.time}
        type="radio"
        name={options.sec}
        value={options.sec}
        bind:group={selectedTimeUnit} />
      {options.sec}
    </label>
    <label class="radio" class:disabled={selectedRepsTime !== options.time}>
      <input
        disabled={selectedRepsTime !== options.time}
        type="radio"
        name={options.min}
        value={options.min}
        bind:group={selectedTimeUnit} />
      {options.min}
    </label>
    <!-- Load inputs -->
    <Input
      label="Load"
      name="load"
      value={load}
      on:input={e => (load = e.target.value)} />
    <!-- Selected load unit -->
    <label class="radio">
      <input
        type="radio"
        name={options.lbs}
        value={options.lbs}
        bind:group={selectedLoadUnit} />
      {options.lbs}
    </label>
    <label class="radio">
      <input
        type="radio"
        name={options.kg}
        value={options.kg}
        bind:group={selectedLoadUnit} />
      {options.kg}
    </label>
  </div>
</EditFormModalLayout>
