<script>
  // Svelte
  import { goto } from "@sapper/app";
  import { onMount, getContext, setContext } from "svelte";

  // FSM
  import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import TemplateForm from "@/components/templates/TemplateForm.svelte";
  import EditExerciseModal from "@/components/templates/EditExerciseModal.svelte";
  import EditExecutionModal from "@/components/templates/EditExecutionModal.svelte";

  const { editTemplateState, editTemplateSend } = getContext("editTemplate");
  const { exercisesState, exercisesSend } = useMachine(exercisesMachine);

  setContext("editExercise", {});

  onMount(() => {
    exercisesSend({ type: "LOAD" });
  });

  export let isNew = true;

  let templateName = $editTemplateState.context.template.name;
  $: templateExercises = $editTemplateState.context.template.exercises;
  $: exercises = $exercisesState.context.exercises;

  function onNameInput(e) {
    editTemplateSend({ type: "NAME_INPUT", params: { value: e.detail } });
  }

  function onAddExercise() {
    editTemplateSend({ type: "ADD_EXERCISE" });
  }

  function onEditExercise(e) {
    editTemplateSend({
      type: "EDIT_EXERCISE",
      params: {
        exercise: e.detail.exercise,
        movement: e.detail.movement
      }
    });
  }

  function onSaveExercise(e) {
    editTemplateSend({
      type: "SAVE_EXERCISE",
      params: {
        exercise: e.detail
      }
    });
  }

  function onDeleteExercise(e) {
    editTemplateSend({
      type: "DELETE_EXERCISE",
      params: {
        exerciseId: e.detail
      }
    });
  }

  function onAddExecution(e) {
    editTemplateSend({
      type: "ADD_EXECUTION",
      params: e.detail
    });
  }

  function onDeleteExecution(e) {
    editTemplateSend({
      type: "DELETE_EXECUTION",
      params: e.detail
    });
  }

  function onEditExecution(e) {
    editTemplateSend({
      type: "EDIT_EXECUTION",
      params: e.detail
    });
  }

  function onSaveExecution(e) {
    editTemplateSend({
      type: "SAVE_EXECUTION",
      params: {
        executionData: e.detail
      }
    });
  }

  function onAddCancel() {
    editTemplateSend({ type: "CANCEL" });
  }

  function onSaveTemplate() {
    editTemplateSend({ type: "SAVE_TEMPLATE" });
  }
</script>

<style>
  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 80%;
    margin: 0 auto;
    padding: 3rem 1rem;
  }

  .actions a {
    text-decoration: none;
  }
</style>

<!-- Header -->
<h1>{isNew ? 'Creating' : 'Editing'} template...</h1>
<!-- Template form -->
<TemplateForm
  {templateExercises}
  {templateName}
  on:nameinput={onNameInput}
  on:addexercise={onAddExercise}
  on:editexercise={onEditExercise}
  on:deleteexercise={onDeleteExercise}
  on:addexecution={onAddExecution}
  on:editexecution={onEditExecution}
  on:deleteexecution={onDeleteExecution} />
<!-- Edit exercise modal -->
{#if $editTemplateState.matches('exercise')}
  <EditExerciseModal
    {exercises}
    isEditing={$editTemplateState.matches('exercise.editing')}
    editedMovement={$editTemplateState.context.editedExercise.state.context.movement.exercise.name}
    on:cancel={onAddCancel}
    on:save={onSaveExercise} />
{/if}
<!-- Edit execution modal -->
{#if $editTemplateState.matches('execution')}
  <EditExecutionModal
    on:cancel={onAddCancel}
    on:save={onSaveExecution}
    editedExecution={$editTemplateState.context.editedExercise.state.context.execution}
    exerciseName={$editTemplateState.context.editedExercise.state.context.movement.exercise.name} />
{/if}
<!-- Template buttons -->
<div class="actions">
  <a href="/templates">
    <Button color="error" variant="filled">
      <i class="material-icons">cancel</i>
      Cancel
    </Button>
  </a>
  <Button color="action" variant="filled" on:click={onSaveTemplate}>
    <i class="material-icons">done</i>
    {isNew ? 'Create' : 'Save'}
  </Button>
</div>
