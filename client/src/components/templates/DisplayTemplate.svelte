<script>
  // Svelte
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  // Components
  import Button from "@/components/UI/Button.svelte";

  const dispatch = createEventDispatcher();

  export let template;

  function onDelete() {
    dispatch("delete");
  }

  function onEdit() {
    dispatch("edit");
  }
</script>

<style>
  h1 {
    color: var(--color-info);
  }

  li {
    background-color: var(--color-fg);
  }

  li:nth-of-type(even) {
    background-color: var(--color-fg-dark);
  }

  .movement {
    display: flex;
    align-items: center;
    padding: 0.5rem;
  }

  .exercise-name {
    width: 50%;
    font-weight: bold;
  }

  .executions {
    width: 50%;
  }

  .execution {
    display: flex;
    justify-content: space-between;
  }

  .execution {
    margin: 0;
  }

  .execution .bold {
    font-weight: bold;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    width: 80%;
    margin: 0 auto;
    padding: 3rem 1rem;
  }
</style>

<div
  in:fly|local={{ x: 30 }}
  out:fly|local={{ x: 30, duration: 200 }}
  on:outroend>
  <h1>{template.name}</h1>
  <ul class="exercise-list">
    {#each template.exercises as exercise (exercise._id)}
      <li>
        {#each exercise.movements as movement (movement._id)}
          <div class="movement">
            <p class="exercise-name">{movement.exercise.name}</p>
            <div class="executions">
              {#each movement.executions as execution (execution._id)}
                <p class="execution">
                  <span class="bold">{execution.sets}</span>
                  <span>x</span>
                  {#if execution.reps}
                    <span class="bold">{execution.reps}</span>
                  {:else}
                    <span class="bold">{execution.time.amount}</span>
                    <span class="bold">
                      {execution.time.unit.toLowerCase()}
                    </span>
                  {/if}
                  <span>|</span>
                  <span class="bold">
                    {execution.load.amount} {execution.load.unit.toLowerCase()}
                  </span>
                </p>
              {/each}
            </div>
          </div>
        {/each}
      </li>
    {/each}
  </ul>
  <!-- Actions -->
  <div class="actions">
    <Button color="error" variant="filled" on:click={onDelete}>
      <i class="material-icons">delete</i>
      Delete
    </Button>
    <Button color="action" variant="filled" on:click={onEdit}>
      <i class="material-icons">edit</i>
      Edit
    </Button>
  </div>
</div>
