<script>
  // svelte
  import { createEventDispatcher } from "svelte";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Button from "@/components/UI/Button.svelte";
  import TemplateExercise from "./TemplateExercise.svelte";

  const dispatch = createEventDispatcher();

  export let templateExercises;

  function onNameInput(e) {
    dispatch("nameinput", e.target.value);
  }

  function onAddExercise() {
    dispatch("addexercise");
  }

  function onAddExecution(e, exercise) {
    dispatch("addexecution", {
      exercise,
      movement: e.detail
    });
  }
</script>

<style>

</style>

<!-- Name input -->
<Input label="Template Name" name="templateName" on:input={onNameInput} />
<!-- Exercises list -->
<ul class="exercise-list">
  {#each templateExercises as exercise (exercise._id)}
    <TemplateExercise
      {exercise}
      on:addexecution={e => onAddExecution(e, exercise)} />
  {/each}
</ul>
<!-- Add exercise button -->
<Button size="big" color="action" on:click={onAddExercise}>
  <i class="material-icons">add_box</i>
  Add Exercise
</Button>
