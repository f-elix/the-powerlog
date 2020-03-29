<script>
  // Svelte
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";

  // FSM
  import { useMachine } from "@/fsm/machineStores.js";
  import { templateMachine } from "@/fsm/templates/templateMachine.js";

  // Components
  import Spinner from "@/components/UI/Spinner.svelte";
  import Button from "@/components/UI/Button.svelte";

  const { page } = stores();
  const { _id } = $page.params;

  const { templateState, templateSend } = useMachine(templateMachine);

  let template;

  $: template = $templateState.context.template;

  onMount(() => {
    templateSend({
      type: "LOAD",
      params: {
        templateId: _id
      }
    });
  });

  function onDelete() {
    templateSend({ type: "DELETE" });
  }

  function onEdit() {
    templateSend({ type: "EDIT" });
  }
</script>

<style>
  li {
    background-color: var(--color-fg);
  }

  li:nth-of-type(even) {
    background-color: var(--color-fg-dark);
  }

  .movement {
    display: flex;
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

  .actions {
    display: flex;
    justify-content: space-between;
    width: 80%;
    margin: 0 auto;
    padding: 3rem 1rem;
  }
</style>

{#if $templateState.matches('fetching')}
  <Spinner />
{/if}
{#if $templateState.matches('loaded')}
  <!-- Title -->
  <h1>{template.name}</h1>
  <ul class="exercise-list">
    {#each template.exercises as exercise (exercise._id)}
      <li>
        {#each exercise.movements as movement (movement._id)}
          <div class="movement">
            <p class="exercise-name">{movement.exercise.name}</p>
            <div class="executions">
              {#each movement.executions as execution (execution._id)}
                <div class="execution">
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
{/if}
