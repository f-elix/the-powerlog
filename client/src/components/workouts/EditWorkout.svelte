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

  function isAbove(nodeA, nodeB) {
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();
    return rectA.top + rectA.height / 2 < rectB.bottom;
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
    const el = $editWorkoutState.context.draggedEl;
    if (!el) {
      return;
    }
    const prevEl = el.previousElementSibling;
    const nextEl = el.nextElementSibling;
    if (prevEl && isAbove(el, prevEl)) {
      const prevExerciseId = prevEl.closest("[data-exercise-id]").dataset
        .exerciseId;
      editWorkoutSend({
        type: "ENTER",
        params: {
          exerciseId: prevExerciseId,
          hoveredEl: prevEl,
          direction: "previous"
        }
      });
    } else if (nextEl && isAbove(nextEl, el)) {
      const nextExerciseId = nextEl.closest("[data-exercise-id]").dataset
        .exerciseId;
      editWorkoutSend({
        type: "ENTER",
        params: {
          exerciseId: nextExerciseId,
          hoveredEl: nextEl,
          direction: "next"
        }
      });
    } else {
      editWorkoutSend({ type: "LEAVE" });
    }
  }

  function onTouchMove(e) {
    const clientx = e.touches[0].clientX;
    const clienty = e.touches[0].clientY;
    const point = document.elementFromPoint(clientx, clienty);
    let targetEl = null;
    if (point !== null) {
      targetEl = point.closest("[data-exercise-id]");
    }
    if (targetEl !== null) {
      editWorkoutSend({
        type: "ENTER",
        params: {
          exerciseId: targetEl.dataset.exerciseId,
          elHeight: targetEl.offsetHeight
        }
      });
    } else {
      editWorkoutSend({ type: "LEAVE" });
    }
    editWorkoutSend({
      type: "MOVE",
      params: {
        x: clientx,
        y: clienty
      }
    });
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
  {/if}
</div>
