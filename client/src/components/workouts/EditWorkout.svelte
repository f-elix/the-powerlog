<script>
  // Svelte
  import { goto } from "@sapper/app";
  import { onMount, getContext, setContext } from "svelte";
  import { fly } from "svelte/transition";

  // FSM
  import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import EditWorkoutForm from "@/components/workouts/EditWorkoutForm.svelte";
  import EditExerciseModal from "@/components/workouts/EditExerciseModal.svelte";
  import EditExecutionModal from "@/components/workouts/EditExecutionModal.svelte";

  const { editWorkoutState, editWorkoutSend } = getContext("editWorkout");
  const { exercisesState, exercisesSend } = useMachine(exercisesMachine);

  setContext("editExercise", {
    editWorkoutState
  });

  onMount(() => {
    exercisesSend({ type: "LOAD" });
  });

  export let isNew = true;
  export let workoutType = "session";

  let workoutName = $editWorkoutState.context.workout.name;
  let workoutDate = $editWorkoutState.context.workout.date;
  $: workoutExercises = $editWorkoutState.context.workout.exercises;
  $: exercises = $exercisesState.context.exercises;
  $: if ($editWorkoutState.matches("dragging")) {
    document.body.dataset.state = "dragging";
  } else {
    delete document.body.dataset.state;
  }

  function onNameInput(e) {
    editWorkoutSend({ type: "NAME_INPUT", params: { value: e.detail } });
  }

  function onDateInput(e) {
    editWorkoutSend({ type: "DATE_INPUT", params: { value: e.detail } });
  }

  function onAddWorkoutExercise() {
    editWorkoutSend({ type: "ADD_EXERCISE" });
  }

  function onEditWorkoutExercise(e) {
    editWorkoutSend({
      type: "EDIT_EXERCISE",
      params: {
        exercise: e.detail
      }
    });
  }

  function onSaveWorkoutExercise(e) {
    editWorkoutSend({
      type: "SAVE_EXERCISE",
      params: {
        exercise: e.detail
      }
    });
  }

  function onDeleteWorkoutExercise(e) {
    editWorkoutSend({
      type: "DELETE_EXERCISE",
      params: {
        exerciseId: e.detail
      }
    });
  }

  function onAddMovement() {
    editWorkoutSend({ type: "ADD_MOVEMENT" });
  }

  function onDeleteMovement(e) {
    editWorkoutSend({
      type: "DELETE_MOVEMENT",
      params: {
        movementId: e.detail
      }
    });
  }

  function onExerciseInput(e) {
    editWorkoutSend({
      type: "EXERCISE_INPUT",
      params: e.detail
    });
  }

  function onAddExecution(e) {
    editWorkoutSend({
      type: "ADD_EXECUTION",
      params: e.detail
    });
  }

  function onDeleteExecution(e) {
    editWorkoutSend({
      type: "DELETE_EXECUTION",
      params: e.detail
    });
  }

  function onEditExecution(e) {
    editWorkoutSend({
      type: "EDIT_EXECUTION",
      params: e.detail
    });
  }

  function onSaveExecution(e) {
    editWorkoutSend({
      type: "SAVE_EXECUTION",
      params: {
        executionData: e.detail
      }
    });
  }

  function onAddCancel() {
    editWorkoutSend({ type: "CANCEL" });
  }

  function onDrag(e) {
    editWorkoutSend({
      type: "DRAG",
      params: {
        exercise: e.detail.exercise,
        x: e.detail.x,
        y: e.detail.y
      }
    });
  }

  function onPointerEnter(e) {
    editWorkoutSend({
      type: "ENTER",
      params: {
        exerciseId: e.detail.exerciseId,
        elHeight: e.detail.elHeight
      }
    });
  }

  function onDrop() {
    editWorkoutSend({ type: "DROP" });
  }

  function onMove(e) {
    editWorkoutSend({
      type: "MOVE",
      params: {
        x: e.clientX,
        y: e.clientY
      }
    });
  }

  function onTouchMove(e) {
    const pagex = e.touches[0].pageX;
    const pagey = e.touches[0].pageY;
    const targetEl = document
      .elementFromPoint(pagex, pagey)
      .closest("[data-exercise-id]");
    if (targetEl) {
      editWorkoutSend({
        type: "ENTER",
        params: {
          exerciseId: targetEl.dataset.exerciseId,
          elHeight: targetEl.offsetHeight
        }
      });
    } else {
      editWorkoutSend({ type: "LEAVE" });
      editWorkoutSend({
        type: "MOVE",
        params: {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
      });
    }
  }

  function onPointerLeave() {
    editWorkoutSend({ type: "LEAVE" });
  }

  function onSaveWorkout() {
    if (workoutType === "session") {
      editWorkoutSend({ type: "SAVE_SESSION" });
    } else if (workoutType === "template") {
      editWorkoutSend({ type: "SAVE_TEMPLATE" });
    }
  }

  function onCancelEdit() {
    editWorkoutSend({ type: "CANCEL_EDIT" });
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
</style>

<svelte:body
  on:pointerup={onDrop}
  on:touchend={onDrop}
  on:pointermove={onMove}
  on:touchmove={onTouchMove} />

<div
  in:fly|local={{ x: 30 }}
  out:fly|local={{ x: 30, duration: 200 }}
  on:outroend>
  <!-- Header -->
  <h1>{isNew ? 'Creating' : 'Editing'} {workoutType}...</h1>
  <!-- Workout form -->
  <EditWorkoutForm
    {workoutType}
    {workoutExercises}
    {workoutName}
    {workoutDate}
    on:nameinput={onNameInput}
    on:dateinput={onDateInput}
    on:addexercise={onAddWorkoutExercise}
    on:editexercise={onEditWorkoutExercise}
    on:deleteexercise={onDeleteWorkoutExercise}
    on:addexecution={onAddExecution}
    on:editexecution={onEditExecution}
    on:deleteexecution={onDeleteExecution}
    on:drag={onDrag}
    on:pointerenter={onPointerEnter}
    on:pointerleave={onPointerLeave} />
  <!-- Edit exercise modal -->
  {#if $editWorkoutState.matches('exercise')}
    <EditExerciseModal
      {exercises}
      isEditing={$editWorkoutState.matches('exercise.editing')}
      editedExercise={$editWorkoutState.context.editedExercise ? $editWorkoutState.context.editedExercise.state.context.workoutExercise : null}
      exerciseError={$editWorkoutState.context.editedExercise ? $editWorkoutState.context.editedExercise.state.context.exerciseError : ''}
      on:exerciseinput={onExerciseInput}
      on:addmovement={onAddMovement}
      on:deletemovement={onDeleteMovement}
      on:cancel={onAddCancel}
      on:save={onSaveWorkoutExercise} />
  {/if}
  <!-- Edit execution modal -->
  {#if $editWorkoutState.matches('execution')}
    <EditExecutionModal
      on:cancel={onAddCancel}
      on:save={onSaveExecution}
      executionError={$editWorkoutState.context.editedExercise ? $editWorkoutState.context.editedExercise.state.context.executionError : ''}
      editedExecution={$editWorkoutState.context.editedExercise.state.context.execution}
      exerciseName={$editWorkoutState.context.editedExercise.state.context.movement.exercise.name} />
  {/if}
  <!-- Workout buttons -->
  <div class="actions">
    <Button color="error" variant="filled" on:click={onCancelEdit}>
      <i class="material-icons">cancel</i>
      Cancel
    </Button>
    <Button color="action" variant="filled" on:click={onSaveWorkout}>
      <i class="material-icons">done</i>
      {isNew ? 'Create' : 'Save'}
    </Button>
  </div>
</div>
