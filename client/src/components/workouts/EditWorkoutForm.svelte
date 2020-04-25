<script>
  // svelte
  import { createEventDispatcher, getContext } from "svelte";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Button from "@/components/UI/Button.svelte";
  import EditWorkoutCardExercise from "./EditWorkoutCardExercise.svelte";

  const dispatch = createEventDispatcher();

  const { editWorkoutState } = getContext("editWorkout");

  export let workoutType;
  export let workoutDate = null;
  export let workoutName;
  export let workoutNotes;
  export let workoutInstructions;
  export let workoutTemplateInstructions;
  export let workoutExercises;

  const types = {
    session: "session",
    template: "template"
  };

  $: draggedExercise = $editWorkoutState.context.draggedExercise;
  $: x = $editWorkoutState.context.x;
  $: y = $editWorkoutState.context.y;

  function onDateInput(e) {
    dispatch("dateinput", e.target.value);
  }

  function onNameInput(e) {
    dispatch("nameinput", e.target.value);
  }

  function onNotesInput(e) {
    dispatch("notesinput", e.target.value);
  }

  function onInstructionsInput(e) {
    dispatch("instructionsinput", e.target.value);
  }

  function onAddExercise() {
    dispatch("addexercise");
  }

  function onUseTemplate() {
    dispatch("usetemplate");
  }

  function onPointerEnter(e, exercise) {
    const elHeight = e.currentTarget.offsetHeight;
    dispatch("pointerenter", {
      exerciseId: exercise._id,
      elHeight
    });
  }

  function move(node, animation, params) {
    const { exercise } = params;
    if (
      $editWorkoutState.matches("dragging") &&
      draggedExercise._id === exercise._id
    ) {
      return {
        easing: _ => 0
      };
    }

    return flip(node, animation, { duration: 200 });
  }
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
  {#each workoutExercises as exercise (exercise._id)}
    <li
      style={$editWorkoutState.matches('dragging') && draggedExercise._id === exercise._id ? `transform: translate3d(${x}px, ${y}px, 0px) scale(1.025);` : ''}
      class:dragged={$editWorkoutState.matches('dragging') && draggedExercise._id === exercise._id}
      data-exercise-id={exercise._id}
      animate:move={{ exercise }}
      in:fly|local={{ x: 30 }}
      out:fly|local={{ x: 30, duration: 200 }}
      on:pointerenter={e => onPointerEnter(e, exercise)}
      on:pointerleave>
      <EditWorkoutCardExercise
        {exercise}
        on:editexercise
        on:deleteexercise
        on:addexecution
        on:editexecution
        on:deleteexecution
        on:drag />
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
  <Button size="big" color="action" on:click={onAddExercise}>
    <i class="material-icons">add_box</i>
    Add Exercise
  </Button>
  <!-- Use template button -->
  {#if workoutType === types.session}
    <Button size="big" color="action" on:click={onUseTemplate}>
      <i class="material-icons">note_add</i>
      Use Template
    </Button>
  {/if}
</div>
