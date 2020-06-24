<script>
  // Svelte
  import { route } from "@sveltech/routify";
  import { getContext, createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import { goto, params } from "@sveltech/routify";

  // Components
  import Button from "@/components/UI/Button.svelte";

  const dispatch = createEventDispatcher();

  const { workoutState, workoutSend } = getContext("workout");

  $: workout = $workoutState.context.workoutData;

  function onDelete() {
    dispatch("delete");
  }

  function onEdit() {
    workoutSend({ type: "EDIT" });
  }

  function onDisplayOut() {
    workoutSend({ type: "DISPLAY_OUT" });
  }

  function onUseAsTemplate() {
    dispatch("useastemplate");
  }
</script>

<style>
  .back-btn-link {
    display: block;
    margin-top: 2rem;
    color: var(--color-primary);
    text-decoration: none;
  }

  .back-btn-link span {
    display: flex;
    align-items: center;
    font-size: var(--text-big);
  }

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

  .execution .sets {
    display: flex;
    justify-content: space-between;
    flex-basis: 40%;
  }

  .execution .load {
    flex-basis: 35%;
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
  on:outroend={onDisplayOut}>
  <h1>{workout.name}</h1>
  {#if workout.date}
    <h2>{workout.date}</h2>
  {/if}
  {#if workout.instructions}
    <p>{workout.instructions}</p>
  {/if}
  {#if workout.templateInstructions}
    <p>{workout.templateInstructions}</p>
  {/if}
  <ul class="exercise-list">
    {#each workout.exercises as exercise (exercise._id)}
      <li>
        {#each exercise.movements as movement (movement._id)}
          <div class="movement">
            <p class="exercise-name">{movement.exercise.name}</p>
            <div class="executions">
              {#each movement.executions as execution (execution._id)}
                <p class="execution">
                  <span class="sets">
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
                  </span>
                  <span>|</span>
                  <span class="load bold">
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
  {#if workout.notes}
    <p>{workout.notes}</p>
  {/if}
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
    <Button color="action" on:click={onUseAsTemplate}>
      <i class="material-icons">insert_drive_file</i>
      Use as template
    </Button>
  </div>
  <a href={$route.last.shortPath} class="back-btn-link">
    <Button size="big">
      <span>&larr; Back</span>
    </Button>
  </a>
</div>
