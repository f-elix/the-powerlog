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

  function onCancel() {
    editTemplateSend({ type: "CANCEL" });
  }

  onMount(() => {
    exercisesSend({ type: "LOAD" });
  });
</script>

<style>

</style>

<EditFormLayout on:cancel={onCancel}>
  <h2>Add Exercise</h2>
  <!-- Exercise input -->
  <Input label="Exercise" list="exercises" />
  <datalist id="exercises">
    {#each exercises as exercise (exercise._id)}
      <option value={exercise.name} />
    {/each}
  </datalist>
</EditFormLayout>
