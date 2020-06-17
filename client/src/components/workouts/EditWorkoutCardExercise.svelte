<script>
  // Svelte
  import { getContext } from "svelte";

  // Components
  import Ripple from "@/components/UI/Ripple.svelte";
  import Button from "@/components/UI/Button.svelte";

  const { editWorkoutState, editWorkoutSend } = getContext("editWorkout");

  export let exercise;

  function onEditExercise() {
    editWorkoutSend({
      type: "EDIT_EXERCISE",
      params: {
        exercise
      }
    });
  }

  function onDeleteExercise() {
    editWorkoutSend({
      type: "DELETE_EXERCISE",
      params: {
        exerciseId: exercise._id
      }
    });
  }

  function onAddExecution(movement) {
    editWorkoutSend({
      type: "ADD_EXECUTION",
      params: { exercise, movement }
    });
  }

  function onEditExecution(movement, execution) {
    editWorkoutSend({
      type: "EDIT_EXECUTION",
      params: { exercise, movement, execution }
    });
  }

  function onDeleteExecution(movement, execution) {
    editWorkoutSend({
      type: "DELETE_EXECUTION",
      params: { exercise, movement, execution }
    });
  }

  function onDrag(e) {
    const el = e.target.closest("[data-exercise-id]");
    editWorkoutSend({
      type: "DRAG",
      params: {
        exerciseId: exercise._id,
        x: e.clientX,
        y: e.clientY,
        el
      }
    });
  }
</script>

<style>
  .wrapper {
    --padding: 0.5rem;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 15rem;
    padding: var(--padding);
  }

  .content-ctn {
    height: 100%;
  }

  .content-ctn p {
    margin: 0;
  }

  .content-ctn .movement-name {
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: var(--text-big);
  }

  .content-ctn .set-ctn {
    display: flex;
    align-items: center;
    margin-top: 1rem;
  }

  .content-ctn .set {
    display: flex;
    justify-content: space-between;
    width: 14rem;
    margin-right: 1rem;
  }

  button {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    line-height: 1;
  }

  :global([data-state="dragging"] button) {
    cursor: inherit;
  }

  .add-set {
    display: block;
    height: 4rem;
    margin: 0.5rem 0;
    padding: 0.5rem 0.5rem 0.5rem 0;
    border-radius: 0;
  }

  .add-set span {
    display: flex;
    align-items: center;
    color: var(--color-primary);
  }

  .add-set span i,
  .add-movement span i {
    color: var(--color-action);
  }

  .add-set {
    width: 10rem;
  }

  button.edit {
    color: var(--color-info);
  }

  button.edit i {
    font-size: var(--text-big);
  }

  button.delete-execution,
  button.delete-exercise {
    color: var(--color-error);
  }

  .exercise-btn-ctn {
    position: absolute;
    top: var(--padding);
    right: var(--padding);
    display: flex;
    align-items: center;
  }

  button.handle {
    color: var(--color-primary);
    cursor: inherit;
  }

  button.handle.cursor-grab {
    cursor: grab;
  }
</style>

<div class="wrapper">
  <!-- Content -->
  <div class="content-ctn">
    {#each exercise.movements as movement}
      <p class="movement-name">
        <span>{movement.exercise.name}</span>
      </p>
      {#each movement.executions as execution, i}
        <div class="set-ctn">
          <p class="set">
            <span>{execution.sets}</span>
            <span>x</span>
            {#if execution.reps !== undefined}
              <span>{execution.reps}</span>
            {:else}
              <span>{execution.time.amount}</span>
              <span>{execution.time.unit.toLowerCase()}</span>
            {/if}
            <span>|</span>
            <span>
              {execution.load.amount} {execution.load.unit.toLowerCase()}
            </span>
          </p>
          <!-- Edit execution btn -->
          <button class="edit" on:click={onEditExecution(movement, execution)}>
            <i class="material-icons">edit</i>
            <span class="screen-reader-text">Edit</span>
            <Ripple />
          </button>
          <!-- Delete execution btn -->
          <button
            class="delete-execution"
            on:click={onDeleteExecution(movement, execution)}>
            <i class="material-icons">clear</i>
            <span class="screen-reader-text">Delete</span>
            <Ripple />
          </button>
        </div>
      {/each}
      <!-- Add execution btn -->
      <button class="add-set" on:click={onAddExecution(movement)}>
        <span>
          <i class="material-icons">add_circle_outline</i>
          Add Set
        </span>
        <Ripple />
      </button>
    {/each}
  </div>
  <!-- Handle btn -->
  <button
    class="handle"
    on:pointerdown={onDrag}
    on:touchstart|preventDefault={() => {}}
    class:cursor-grab={!$editWorkoutState.matches('dragging')}>
    <i class="material-icons">reorder</i>
    <span class="screen-reader-text">Re-order</span>
  </button>
  <div class="exercise-btn-ctn">
    <!-- Edit exercise btn -->
    <button class="edit" on:click={onEditExercise}>
      <i class="material-icons">edit</i>
      <span class="screen-reader-text">Edit</span>
      <Ripple />
    </button>
    <!-- Delete btn -->
    <button class="delete-exercise" on:click={onDeleteExercise}>
      <i class="material-icons">delete</i>
      <span class="screen-reader-text">Delete</span>
      <Ripple />
    </button>
  </div>
</div>
