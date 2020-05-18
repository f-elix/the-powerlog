<script>
  // Svelte
  import { onMount, getContext } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { flip } from "svelte/animate";

  // FSM
  import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import CardExercise from "@/components/exercises/CardExercise.svelte";
  import Button from "@/components/UI/Button.svelte";
  import Input from "@/components/UI/Input.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";
  import ModalLayout from "@/components/UI/ModalLayout.svelte";
  import SearchForm from "@/components/UI/SearchForm.svelte";

  const pageTransition = getContext("page-transition");

  const { exercisesState, exercisesSend } = useMachine(exercisesMachine);

  let exercises = [];

  $: exercises = $exercisesState.context.filteredExercises
    ? $exercisesState.context.filteredExercises
    : $exercisesState.context.exercises;
  $: editService = $exercisesState.context.editedExercise;

  function onLoad() {
    exercisesSend({ type: "LOAD" });
  }

  function onCreateExercise() {
    exercisesSend({ type: "CREATE" });
  }

  function onNewExerciseInput(e) {
    exercisesSend({
      type: "INPUT",
      params: {
        value: e.target.value
      }
    });
  }

  function onCreate() {
    exercisesSend({ type: "CREATE" });
  }

  function onDiscard() {
    exercisesSend({ type: "DISCARD" });
  }

  function onDelete(e) {
    exercisesSend({ type: "DELETE", params: { exercise: e.detail } });
  }

  function onEdit(e) {
    exercisesSend({ type: "EDIT", params: { exercise: e.detail } });
  }

  function onSearchInput(e) {
    exercisesSend({ type: "SEARCH_INPUT", params: { value: e.target.value } });
  }

  onMount(() => {
    onLoad();
  });
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

  .create-form .btn-ctn {
    display: flex;
    justify-content: space-around;
    margin: 2rem auto;
  }

  .message {
    text-align: center;
  }

  .error {
    color: var(--color-error);
  }
</style>

<!-- routify:options index=1 -->
<section in:fly={pageTransition}>
  <h1>your exercises</h1>
  <!-- Search form -->
  <SearchForm
    on:input={onSearchInput}
    label="Search Exercises"
    name="exercisesSearch" />
  <!-- Add button -->
  <Button
    size="big"
    variant="filled"
    color="action"
    on:click={onCreateExercise}>
    <i class="material-icons">add</i>
    Add new
  </Button>
  <!-- Spinner -->
  {#if $exercisesState.matches('fetching')}
    <Spinner />
  {/if}
  <!-- Exercises list -->
  <ul>
    <!-- No results message -->
    {#if $exercisesState.matches('idle.error')}
      <h2 class="message">{$exercisesState.context.fetchError}</h2>
    {/if}
    {#each exercises as exercise (exercise._id)}
      <li
        animate:flip={{ duration: 200 }}
        out:fly|local={{ duration: 200, x: 30 }}
        in:fade|local={{ duration: 200 }}>
        <CardExercise
          {exercise}
          {editService}
          on:edit={onEdit}
          on:delete={onDelete} />
      </li>
    {/each}
  </ul>

  <!-- Modal -->
  {#if $exercisesState.matches('creating')}
    <ModalLayout on:click={onDiscard}>
      <!-- Error message -->
      {#if $exercisesState.matches('creating.idle.error')}
        <p class="message error">{$exercisesState.context.fetchError}</p>
      {/if}
      <!-- Exercise form -->
      <form class="create-form" on:submit|preventDefault={onCreate} novalidate>
        <Input
          autofocus={true}
          name="exerciseName"
          label="Exercise Name"
          on:input={onNewExerciseInput} />
        <div class="btn-ctn">
          <Button color="error" variant="filled" on:click={onDiscard}>
            Discard
          </Button>
          <Button color="action" variant="filled" type="submit">Create</Button>
        </div>
      </form>
    </ModalLayout>
  {/if}
</section>
