<script>
  // Svelte
  import { getContext, onMount } from "svelte";

  //FSM
  import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import EditFormLayout from "./EditFormLayout.svelte";

  const { editTemplateState, editTemplateSend } = getContext("editTemplate");
  const { exercisesState, exercisesSend } = useMachine(exercisesMachine);

  const addExerciseService = $editTemplateState.children.addExercise;

  $: exercises = $exercisesState.context.exercises;

  let newExercise;

  function onInput(e) {
    const option = document.querySelector(`option[value="${e.target.value}"]`);
    if (option) {
      newExercise = JSON.parse(option.dataset.exercise);
    }
  }

  function onCancel() {
    editTemplateSend({ type: "CANCEL" });
  }

  function onSave() {
    if (!newExercise) {
      return;
    }
    editTemplateSend({
      type: "SAVE",
      params: {
        newExercise
      }
    });
  }

  onMount(() => {
    exercisesSend({ type: "LOAD" });
  });
</script>

<style>

</style>

<EditFormLayout on:cancel={onCancel} on:submit={onSave}>
  <h2>Add Exercise</h2>
  <!-- Exercise input -->
  <Input label="Exercise" list="exercises" on:input={onInput} />
  <datalist id="exercises">
    {#each exercises as exercise (exercise._id)}
      <option value={exercise.name} data-exercise={JSON.stringify(exercise)} />
    {/each}
  </datalist>
</EditFormLayout>
