<script>
  // svelte
  import { getContext } from "svelte";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Button from "@/components/UI/Button.svelte";
  import EditWorkoutCardExercise from "./EditWorkoutCardExercise.svelte";

  const { editWorkoutState, editWorkoutSend } = getContext("editWorkout");

  const types = {
    session: "session",
    template: "template"
  };

  export let workoutType;
  $: workoutDate = $editWorkoutState.context.workout.date;
  $: workoutName = $editWorkoutState.context.workout.name;
  $: workoutNotes = $editWorkoutState.context.workout.notes;
  $: workoutInstructions = $editWorkoutState.context.workout.instructions;
  $: workoutTemplateInstructions =
    $editWorkoutState.context.workout.templateInstructions;
  $: workoutExercises = $editWorkoutState.context.workout.exercises;
  $: draggedExerciseId = $editWorkoutState.context.draggedId;
  $: x = $editWorkoutState.context.x;
  $: y = $editWorkoutState.context.y;

  function move(node, animation, params) {
    const { exerciseId } = params;
    if (
      $editWorkoutState.matches("dragging") &&
      draggedExerciseId === exerciseId
    ) {
      return {
        easing: _ => 0
      };
    }
    return flip(node, animation, { duration: 100 });
  }

  function onDateInput(e) {
    editWorkoutSend({ type: "DATE_INPUT", params: { value: e.target.value } });
  }

  function onNameInput(e) {
    editWorkoutSend({ type: "NAME_INPUT", params: { value: e.target.value } });
  }

  function onNotesInput(e) {
    editWorkoutSend({ type: "NOTES_INPUT", params: { value: e.target.value } });
  }

  function onInstructionsInput(e) {
    editWorkoutSend({
      type: "INSTRUCTIONS_INPUT",
      params: { value: e.detail }
    });
  }

  function onUseTemplate() {
    editWorkoutSend({ type: "USE_TEMPLATE" });
  }

  //   function onAddExercise() {
  //     editWorkoutSend({ type: "ADD_EXERCISE" });
  //   }
</script>

<style>
  ul li {
    width: 100%;
    max-width: calc(var(--main-width) - (var(--main-h-padding) * 2));
    background-color: var(--color-fg);
    transition: background-color 0.2s linear,
      transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  ul li:nth-of-type(even) {
    background-color: var(--color-fg-dark);
  }

  .dragged.dragged {
    position: relative;
    z-index: 1000;
    background-color: var(--color-fg-light);
    pointer-events: none;
    transition: none;
  }

  .buttons {
    display: grid;
    grid-row-gap: 2rem;
  }
</style>

<!-- Date input -->
{#if workoutType === types.session}
  <Input
    type="date"
    label="Date"
    name="workoutDate"
    on:input={onDateInput}
    value={workoutDate} />
  <br />
{/if}
<!-- Name input -->
<Input
  label="Name"
  name="workoutName"
  errorMessage={$editWorkoutState.context.nameError}
  on:input={onNameInput}
  value={workoutName} />
<!-- Exercises list -->
<ul class="exercise-list">
  <!-- animate:move={{ exerciseId: exercise._id }} -->
  {#each workoutExercises as exercise, index (exercise._id)}
    <li
      style={$editWorkoutState.matches('dragging') && draggedExerciseId === exercise._id ? `transform: scale(1.025) translate3d(${x}px, ${y}px, 0px);` : ''}
      class:dragged={$editWorkoutState.matches('dragging') && draggedExerciseId === exercise._id}
      data-exercise-id={exercise._id}
      data-index={index}
      in:fly|local={{ x: 30 }}
      out:fly|local={{ x: 30, duration: 200 }}>
      <EditWorkoutCardExercise {exercise} />
    </li>
  {/each}
</ul>
{#if workoutType === types.session}
  {#if workoutTemplateInstructions}
    <p>{workoutTemplateInstructions}</p>
  {/if}
  <Input
    type="textarea"
    name="notes"
    label="Notes"
    value={workoutNotes}
    on:input={onNotesInput} />
{/if}
{#if workoutType === types.template}
  <Input
    type="textarea"
    name="notes"
    label="Instructions"
    value={workoutInstructions}
    on:input={onInstructionsInput} />
{/if}
<div class="buttons">
  <!-- Add exercise button -->
  <!-- <Button size="big" color="action" on:click={onAddExercise}>
    <i class="material-icons">add_box</i>
    Add Exercise
  </Button> -->
  <!-- Use template button -->
  {#if workoutType === types.session}
    <Button size="big" color="action" on:click={onUseTemplate}>
      <i class="material-icons">note_add</i>
      Use Template
    </Button>
  {/if}
</div>
