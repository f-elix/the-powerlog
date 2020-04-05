<script>
  // svelte
  import { createEventDispatcher, getContext } from "svelte";
  import { flip } from "svelte/animate";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Button from "@/components/UI/Button.svelte";
  import CardTemplateExercise from "./CardTemplateExercise.svelte";

  const dispatch = createEventDispatcher();

  const { editTemplateState } = getContext("editTemplate");

  export let templateName;
  export let templateExercises;

  function onNameInput(e) {
    dispatch("nameinput", e.target.value);
  }

  function onAddExercise() {
    dispatch("addexercise");
  }
</script>

<style>
  ul li {
    background-color: var(--color-fg);
  }

  ul li:nth-of-type(even) {
    background-color: var(--color-fg-dark);
  }
</style>

<!-- Name input -->
<Input
  label="Template Name"
  name="templateName"
  errorMessage={$editTemplateState.context.nameError}
  on:input={onNameInput}
  value={templateName} />
<!-- Exercises list -->
<ul class="exercise-list">
  {#each templateExercises as exercise (exercise._id)}
    <li animate:flip={{ duration: 200 }}>
      <CardTemplateExercise
        {exercise}
        on:editexercise
        on:deleteexercise
        on:addexecution
        on:editexecution
        on:deleteexecution />
    </li>
  {/each}
</ul>
<!-- Add exercise button -->
<Button size="big" color="action" on:click={onAddExercise}>
  <i class="material-icons">add_box</i>
  Add Exercise
</Button>
