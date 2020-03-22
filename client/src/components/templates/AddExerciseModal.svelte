<script>
  // Svelte
  import { getContext, onMount } from "svelte";

  //FSM
  import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Select from "@/components/UI/Select.svelte";
  import Button from "@/components/UI/Button.svelte";
  import ModalLayout from "@/components/UI/ModalLayout.svelte";

  const { editTemplateState, editTemplateSend } = getContext("editTemplate");
  const { exercisesState, exercisesSend } = useMachine(exercisesMachine);

  const addExerciseService = $editTemplateState.children.addExercise;

  $: exercises = $exercisesState.context.exercises;

  let repsTimeSelectedOption = "Reps";

  function onCancel() {
    editTemplateSend({ type: "CANCEL" });
  }

  onMount(() => {
    exercisesSend({ type: "LOAD" });
  });
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

  .btn-ctn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
</style>

<ModalLayout on:click={onCancel}>
  <form novalidate>
    <h2>Add Exercise</h2>
    <!-- Exercise input -->
    <Input label="Exercise" list="exercises" />
    <datalist id="exercises">
      {#each exercises as exercise (exercise._id)}
        <option value={exercise.name} />
      {/each}
    </datalist>
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
    <!-- actions btn -->
    <div class="btn-ctn">
      <Button variant="filled" color="error" on:click={onCancel}>
        <i class="material-icons">close</i>
        Cancel
      </Button>
      <Button variant="filled" color="action">
        <i class="material-icons">done</i>
        Done
      </Button>
    </div>
  </form>
</ModalLayout>
