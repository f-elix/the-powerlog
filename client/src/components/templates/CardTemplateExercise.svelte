<script>
  // Svelte
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  // Components
  import Ripple from "@/components/UI/Ripple.svelte";
  import Button from "@/components/UI/Button.svelte";

  const dispatch = createEventDispatcher();

  export let exercise;

  function onEditExercise(movement) {
    dispatch("editexercise", { exercise, movement });
  }

  function onDeleteExercise() {
    dispatch("deleteexercise", exercise._id);
  }

  function onAddExecution(movement) {
    dispatch("addexecution", { exercise, movement });
  }

  function onEditExecution(movement, execution) {
    dispatch("editexecution", { exercise, movement, execution });
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
  }

  .add-set-btn {
    width: 10rem;
    margin: 0.5rem 0;
    padding: 0.5rem 0.5rem 0.5rem 0;
    color: var(--color-action);
  }

  .add-set-btn span {
    display: flex;
    align-items: center;
  }

  button {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    line-height: 1;
  }

  button.edit {
    color: var(--color-info);
  }

  button.edit i {
    font-size: var(--text-big);
  }

  button.delete {
    position: absolute;
    top: var(--padding);
    right: var(--padding);
    color: var(--color-error);
  }

  button.handle {
    color: var(--color-primary);
  }
</style>

<div
  class="wrapper"
  in:fly|local={{ x: 30 }}
  out:fly|local={{ x: 30, duration: 200 }}>
  <!-- Content -->
  <div class="content-ctn">
    {#each exercise.movements as movement}
      <p class="movement-name">
        <span>{movement.exercise.name}</span>
        <!-- Edit exercise btn -->
        <button class="edit" on:click={onEditExercise(movement)}>
          <i class="material-icons">edit</i>
          <span class="screen-reader-text">Edit</span>
          <Ripple />
        </button>
      </p>
      {#each movement.executions as execution, i}
        <div class="set-ctn">
          <p class="set">
            <span>{execution.sets}</span>
            <span>X</span>
            {#if execution.reps}
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
        </div>
      {/each}
      <!-- Add set btn -->
      <button class="add-set-btn" on:click={onAddExecution(movement)}>
        <span>
          <i class="material-icons">add_circle_outline</i>
          Add Set
        </span>
        <Ripple />
      </button>
    {/each}
  </div>
  <!-- Handle btn -->
  <button class="handle">
    <i class="material-icons">reorder</i>
    <span class="screen-reader-text">Re-order</span>
  </button>
  <!-- Delete btn -->
  <button class="delete" on:click={onDeleteExercise}>
    <i class="material-icons">delete</i>
    <span class="screen-reader-text">Delete</span>
    <Ripple />
  </button>
</div>
