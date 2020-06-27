<script>
  // Svelte
  import { onMount, onDestroy, setContext, getContext } from "svelte";
  import { fly } from "svelte/transition";

  // FSM
  import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { templatesMachine } from "@/fsm/templates/templatesMachine.js";
  import { editWorkoutMachine } from "@/fsm/workouts/editWorkoutMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";
  import EditWorkoutForm from "@/components/workouts/EditWorkoutForm.svelte";
  import EditExerciseModal from "@/components/workouts/EditExerciseModal.svelte";
  import EditExecutionModal from "@/components/workouts/EditExecutionModal.svelte";
  import SelectTemplateModal from "@/components/workouts/SelectTemplateModal.svelte";
  import ExerciseHistoryModal from "@/components/workouts/ExerciseHistoryModal.svelte";

  const { exercisesState, exercisesSend } = useMachine(exercisesMachine);
  const { templatesState, templatesSend } = useMachine(templatesMachine);
  const { editWorkoutState, editWorkoutSend } = getContext("editWorkout");

  onMount(() => {
    exercisesSend({ type: "LOAD" });
    templatesSend({ type: "LOAD" });
  });

  export let isNew = true;
  export let workoutType = "session";

  $: exercises = $exercisesState.context.exercises;
  $: templates = $templatesState.context.templates;
  $: if ($editWorkoutState.matches("dragging")) {
    document.body.dataset.state = "dragging";
  } else {
    delete document.body.dataset.state;
  }

  function onDrop() {
    editWorkoutSend({ type: "DROP" });
  }

  function onMove(e) {
    e = e.touches ? e.touches[0] : e;
    const x = e.clientX;
    const y = e.clientY;
    editWorkoutSend({
      type: "MOVE",
      params: {
        x,
        y
      }
    });
    const el = document.querySelector(
      `[data-exercise-id="${$editWorkoutState.context.draggedId}"]`
    );
    if (!el) {
      return;
    }
    const hoveredEl = document
      .elementFromPoint(x, y)
      .closest("[data-exercise-id]");
    if (hoveredEl) {
      const exerciseId = hoveredEl.dataset.exerciseId;
      editWorkoutSend({
        type: "ENTER",
        params: {
          y,
          exerciseId,
          hoveredElHeight: hoveredEl.offsetHeight,
          hoveredIndex: +hoveredEl.dataset.index
        }
      });
    } else {
      editWorkoutSend({ type: "LEAVE" });
    }
  }

  function onSaveWorkout() {
    editWorkoutSend({
      type: `SAVE_${workoutType.toUpperCase()}`,
      params: {
        isNew
      }
    });
  }

  function onCancelEdit() {
    if (isNew) {
      editWorkoutSend({
        type: "DISCARD",
        params: {
          workoutType
        }
      });
    } else {
      editWorkoutSend({ type: "CANCEL" });
    }
  }

  function onAddExercise() {
    editWorkoutSend({ type: "ADD_EXERCISE" });
  }
</script>

<style>
  .actions {
    position: fixed;
    top: 50%;
    right: 0;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 1rem;
    background-color: var(--color-fg-light);
  }

  .actions button {
    width: 4rem;
    height: 4rem;
    margin: 0.5rem;
    border: none;
    color: white;
    box-shadow: var(--shadow-default);
  }

  .actions button .inner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .actions .cancel {
    background-color: var(--color-error);
  }

  .actions .save {
    background-color: var(--color-action);
  }

  .actions .add {
    border: var(--border-thin) var(--color-action);
    background: none;
  }
</style>

<svelte:body
  on:pointerup={onDrop}
  on:touchend={onDrop}
  on:pointermove={onMove}
  on:touchmove={onMove} />

<div
  in:fly|local={{ x: 30, duration: 200 }}
  out:fly|local={{ x: 30, duration: isNew ? 0 : 200 }}
  on:outroend>
  {#if $editWorkoutState.matches('saving') || $editWorkoutState.matches('done')}
    <Spinner />
  {:else}
    <div>
      <!-- Header -->
      <h1>{isNew ? 'Creating' : 'Editing'} {workoutType}...</h1>
      <!-- Workout form -->
      <EditWorkoutForm {workoutType} />
      <!-- Template selection modal -->
      {#if $editWorkoutState.matches('selectingtemplate')}
        <SelectTemplateModal {templates} />
      {/if}
      <!-- Edit exercise modal -->
      {#if $editWorkoutState.matches('exercise')}
        <EditExerciseModal {exercises} />
      {/if}
      <!-- Edit execution modal -->
      {#if $editWorkoutState.matches('execution')}
        <EditExecutionModal />
      {/if}
      <!-- Exercise history modal -->
      {#if $editWorkoutState.matches('exerciseHistory')}
        <ExerciseHistoryModal />
      {/if}
      <!-- Workout buttons -->
      <div class="actions">
        <button class="cancel" on:click={onCancelEdit}>
          <div class="inner">
            <i class="material-icons">cancel</i>
          </div>
          <!-- Cancel -->
        </button>
        <button class="save" on:click={onSaveWorkout}>
          <div class="inner">
            <i class="material-icons">done</i>
          </div>
          <!-- {isNew ? 'Create' : 'Save'} -->
        </button>
        <button class="add" on:click={onAddExercise}>
          <div class="inner">
            <i class="material-icons">add</i>
          </div>
          <!-- {isNew ? 'Create' : 'Save'} -->
        </button>
      </div>
    </div>
  {/if}
</div>
