<script>
  // Svelte
  import { onMount } from "svelte";
  import { flip } from "svelte/animate";
  import { goto } from "@sapper/app";

  // FSM
  import { templatesMachine } from "@/fsm/templates/templatesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import EditWorkoutForm from "@/components/workouts/EditWorkoutForm.svelte";
  import CardWorkout from "@/components/workouts/CardWorkout.svelte";
  import Button from "@/components/UI/Button.svelte";
  import Input from "@/components/UI/Input.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";
  import ModalLayout from "@/components/UI/ModalLayout.svelte";
  import SearchForm from "@/components/UI/SearchForm.svelte";

  const { templatesState, templatesSend } = useMachine(templatesMachine);

  $: templates = $templatesState.context.filteredTemplates
    ? $templatesState.context.filteredTemplates
    : $templatesState.context.templates;

  onMount(() => {
    templatesSend({ type: "LOAD" });
  });

  function onSearchInput(e) {
    templatesSend({
      type: "SEARCH_INPUT",
      params: {
        value: e.target.value
      }
    });
  }

  function onDeleteTemplate(e) {
    templatesSend({
      type: "DELETE",
      params: {
        templateId: e.detail
      }
    });
  }
</script>

<style>
  h1 {
    text-transform: capitalize;
  }

  ul {
    margin: 2rem auto;
    list-style-type: none;
    overflow-x: hidden;
  }

  .message {
    text-align: center;
  }
</style>

<section>
  <h1>your templates</h1>

  <!-- Search form -->
  <SearchForm
    label="Search Templates"
    name="searchTemplates"
    on:input={onSearchInput} />

  <!-- Add button -->
  <Button
    size="big"
    variant="filled"
    color="action"
    on:click={() => goto('/templates/new')}>
    <i class="material-icons">add</i>
    Add new
  </Button>

  <!-- Templates list -->
  <ul>
    <!-- Spinner -->
    {#if $templatesState.matches('fetching')}
      <Spinner />
    {/if}
    <!-- No results message -->
    {#if $templatesState.matches('idle.error')}
      <h2 class="message">{$templatesState.context.fetchError}</h2>
    {/if}
    {#each templates as template (template._id)}
      <li animate:flip={{ duration: 200 }}>
        <CardWorkout
          workout={template}
          workoutType="template"
          on:delete={onDeleteTemplate} />
      </li>
    {/each}
  </ul>
</section>
