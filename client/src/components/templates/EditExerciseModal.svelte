<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import EditFormModalLayout from "./EditFormModalLayout.svelte";

  const dispatch = createEventDispatcher();

  export let exercises;
  export let isEditing = false;
  export let editedMovement;

  let newExercise;

  function onInput(e) {
    const option = document.querySelector(`option[value="${e.target.value}"]`);
    if (option) {
      newExercise = JSON.parse(option.dataset.exercise);
    } else {
      newExercise = {
        name: e.target.value
      };
    }
  }

  function onCancel() {
    dispatch("cancel");
  }

  function onSave() {
    if (!newExercise) {
      return;
    }
    dispatch("save", newExercise);
  }
</script>

<style>

</style>

<EditFormModalLayout on:cancel={onCancel} on:submit={onSave}>
  <h2>{isEditing ? 'Edit' : 'Add'} Exercise</h2>
  <!-- Exercise input -->
  <Input
    label="Exercise"
    list="exercises"
    on:input={onInput}
    value={editedMovement} />
  <datalist id="exercises">
    {#each exercises as exercise (exercise._id)}
      <option value={exercise.name} data-exercise={JSON.stringify(exercise)} />
    {/each}
  </datalist>
</EditFormModalLayout>
