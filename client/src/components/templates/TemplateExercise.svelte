<script>
  // Svelte
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  // Components
  import Ripple from "@/components/UI/Ripple.svelte";
  import Button from "@/components/UI/Button.svelte";

  const dispatch = createEventDispatcher();

  export let exercise;

  function onAddExecution(movement) {
    dispatch("addexecution", { exercise, movement });
  }

  function onDeleteExercise() {
    dispatch("deleteexercise", { exerciseId: exercise._id });
  }
</script>

<style>
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background-color: var(--color-fg);
  }

  li:nth-of-type(even) {
    background-color: var(--color-fg-dark);
  }

  .content-ctn {
    width: 65%;
  }

  .content-ctn p {
    margin: 0;
  }

  .content-ctn .movement-name {
    font-weight: bold;
    font-size: var(--text-big);
  }

  .content-ctn .set {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }

  .content-ctn .set p {
    width: 40%;
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

  .actions-ctn {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .actions-ctn button.edit {
    color: var(--color-info);
  }

  .actions-ctn button.delete {
    color: var(--color-error);
  }

  .actions-ctn button.handle {
    color: var(--color-primary);
  }
</style>

<li in:fly|local={{ x: 30 }} out:fly|local={{ x: 30, duration: 200 }}>
  <!-- Content -->
  <div class="content-ctn">
    {#each exercise.movements as movement}
      <p class="movement-name">{movement.exercise.name}</p>
      {#each movement.executions as execution, i}
        <div class="set">
          <p>
            <span>{execution.sets}</span>
            <span>X</span>
            {#if execution.reps}
              <span>{execution.reps}</span>
            {:else}
              <span>{execution.time.amount}</span>
              <span>{execution.time.unit.toLowerCase()}</span>
            {/if}
          </p>
          <p>
            <span>{execution.load.amount}</span>
            <span>{execution.load.unit.toLowerCase()}</span>
          </p>
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
  <!-- Actions -->
  <div class="actions-ctn">
    <!-- Edit btn -->
    <button class="edit">
      <i class="material-icons">edit</i>
      <span class="screen-reader-text">Edit</span>
      <Ripple />
    </button>
    <!-- Delete btn -->
    <button class="delete" on:click={onDeleteExercise}>
      <i class="material-icons">delete</i>
      <span class="screen-reader-text">Delete</span>
      <Ripple />
    </button>
    <!-- Handle btn -->
    <button class="handle">
      <i class="material-icons">reorder</i>
      <span class="screen-reader-text">Re-order</span>
    </button>
  </div>
</li>
