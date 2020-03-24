<script>
  // svelte
  import { createEventDispatcher, getContext } from "svelte";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Button from "@/components/UI/Button.svelte";
  import TemplateExercise from "./TemplateExercise.svelte";

  const dispatch = createEventDispatcher();

  const { editTemplateState, editTemplateSend } = getContext("editTemplate");

  function onNameInput(e) {
    dispatch("nameinput", e.target.value);
  }

  function onAddExercise() {
    dispatch("addexercise");
  }
</script>

<style>

</style>

<!-- Name input -->
<Input label="Template Name" name="templateName" on:input={onNameInput} />
<!-- Exercises list -->
<ul class="exercise-list">
  <TemplateExercise />
  <TemplateExercise />
</ul>
<!-- Add exercise button -->
<Button size="big" color="action" on:click={onAddExercise}>
  <i class="material-icons">add_box</i>
  Add Exercise
</Button>
