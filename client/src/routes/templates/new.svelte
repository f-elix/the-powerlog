<script>
  // svelte
  import { goto } from "@sapper/app";
  import { onMount } from "svelte";

  // fsm
  import { editTemplateMachine } from "@/fsm/templates/editTemplateMachine.js";
  import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import TemplateForm from "@/components/templates/TemplateForm.svelte";
  import AddExerciseModal from "@/components/templates/AddExerciseModal.svelte";
  import AddExecutionModal from "@/components/templates/AddExecutionModal.svelte";

  const { editTemplateState, editTemplateSend } = useMachine(
    editTemplateMachine
  );
  const { exercisesState, exercisesSend } = useMachine(exercisesMachine);

  onMount(() => {
    exercisesSend({ type: "LOAD" });
  });

  $: exercises = $exercisesState.context.exercises;
  $: templateExercises = $editTemplateState.context.exercises;

  function onCancel() {
    goto("/templates");
  }

  function onNameInput(e) {
    editTemplateSend({ type: "NAME_INPUT", params: { value: e.detail } });
  }

  function onAddExercise() {
    editTemplateSend({ type: "ADD_EXERCISE" });
  }

  function onAddExecution(e) {
    editTemplateSend({
      type: "ADD_EXECUTION",
      params: {
        exercise: e.detail
      }
    });
  }

  function onAddSave(e) {
    editTemplateSend({
      type: "SAVE",
      params: {
        value: e.detail
      }
    });
  }

  function onAddCancel() {
    editTemplateSend({ type: "CANCEL" });
  }
</script>

<style>
  .template-btn-ctn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 80%;
    margin: 0 auto;
    padding: 3rem 1rem;
  }
</style>

<!-- Header -->
<h1>Create a Template</h1>
<!-- Template form -->
<TemplateForm
  {templateExercises}
  on:nameinput={onNameInput}
  on:addexercise={onAddExercise}
  on:addexecution={onAddExecution} />
<!-- Add exercise modal -->
{#if $editTemplateState.matches('addingexercise')}
  <AddExerciseModal {exercises} on:cancel={onAddCancel} on:save={onAddSave} />
{/if}
<!-- Add set modal -->
{#if $editTemplateState.matches('addingexecution')}
  <AddExecutionModal on:cancel={onAddCancel} on:save={onAddSave} />
{/if}
<!-- Template buttons -->
<div class="template-btn-ctn">
  <Button color="error" variant="filled" on:click={onCancel}>Cancel</Button>
  <Button color="action" variant="filled">Create</Button>
</div>
