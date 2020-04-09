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

  setContext("editExercise", {
    editTemplateState
  });

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

  function onAddTemplateExercise() {
    editTemplateSend({ type: "ADD_EXERCISE" });
  }

  function onEditTemplateExercise(e) {
    editTemplateSend({
      type: "EDIT_EXERCISE",
      params: {
        exercise: e.detail
      }
    });
  }

  function onSaveTemplateExercise(e) {
    editTemplateSend({
      type: "SAVE_EXERCISE",
      params: {
        exercise: e.detail
      }
    });
  }

  function onDeleteTemplateExercise(e) {
    editTemplateSend({
      type: "DELETE_EXERCISE",
      params: {
        exerciseId: e.detail
      }
    });
  }

  function onAddMovement() {
    editTemplateSend({ type: "ADD_MOVEMENT" });
  }

  function onDeleteMovement(e) {
    editTemplateSend({
      type: "DELETE_MOVEMENT",
      params: {
        movementId: e.detail
      }
    });
  }

  function onExerciseInput(e) {
    editTemplateSend({
      type: "EXERCISE_INPUT",
      params: e.detail
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

  function onDrag(e) {
    editTemplateSend({
      type: "DRAG",
      params: {
        pointerx: e.detail.pointerx,
        pointery: e.detail.pointery,
        exercise: e.detail.exercise
      }
    });
  }

  function onMouseOver(e) {
    editTemplateSend({
      type: "HOVER",
      params: {
        exercise: e.detail
      }
    });
  }

  function onDrop() {
    editTemplateSend({ type: "DROP" });
  }

  function onMove(e) {
    editTemplateSend({
      type: "MOVE",
      params: {
        x: e.clientX,
        y: e.clientY
      }
    });
  }

  function onLeave() {
    editTemplateSend({ type: "LEAVE" });
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

<div on:mouseup={onDrop} on:mousemove={onMove}>
  <!-- Header -->
  <h1>{isNew ? 'Creating' : 'Editing'} template...</h1>
  <!-- Template form -->
  <TemplateForm
    {templateExercises}
    {templateName}
    on:nameinput={onNameInput}
    on:addexercise={onAddTemplateExercise}
    on:editexercise={onEditTemplateExercise}
    on:deleteexercise={onDeleteTemplateExercise}
    on:addexecution={onAddExecution}
    on:editexecution={onEditExecution}
    on:deleteexecution={onDeleteExecution}
    on:drag={onDrag}
    on:hover={onMouseOver}
    on:leave={onLeave} />
  <!-- Edit exercise modal -->
  {#if $editTemplateState.matches('exercise')}
    <EditExerciseModal
      {exercises}
      isEditing={$editTemplateState.matches('exercise.editing')}
      editedExercise={$editTemplateState.context.editedExercise ? $editTemplateState.context.editedExercise.state.context.templateExercise : null}
      exerciseError={$editTemplateState.context.editedExercise ? $editTemplateState.context.editedExercise.state.context.exerciseError : ''}
      on:exerciseinput={onExerciseInput}
      on:addmovement={onAddMovement}
      on:deletemovement={onDeleteMovement}
      on:cancel={onAddCancel}
      on:save={onSaveTemplateExercise} />
  {/if}
  <!-- Edit execution modal -->
  {#if $editTemplateState.matches('execution')}
    <EditExecutionModal
      on:cancel={onAddCancel}
      on:save={onSaveExecution}
      executionError={$editTemplateState.context.editedExercise ? $editTemplateState.context.editedExercise.state.context.executionError : ''}
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
</div>
