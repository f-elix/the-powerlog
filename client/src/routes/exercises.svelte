<script>
  // Svelte
  import { onMount } from "svelte";

  // FSM
  import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import CardExercise from "@/components/exercises/CardExercise.svelte";
  import Button from "@/components/UI/Button.svelte";
  import Input from "@/components/UI/Input.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";
  import ModalLayout from "@/components/UI/ModalLayout.svelte";

  const exercises = ["squat", "bench", "deadlift", "overhead press"];

  const { exercisesState, exercisesSend } = useMachine(exercisesMachine);

  onMount(() => {
    exercisesSend({ type: "LOAD" });
  });

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
</script>

<style>
  h1 {
    text-transform: capitalize;
  }

  ul {
    margin: 2rem auto;
    list-style-type: none;
  }

  .search-form {
    position: relative;
    margin: 2rem auto;
  }

  .search-form .search-icon {
    position: absolute;
    top: 20%;
    right: 5%;
    z-index: 10;
  }

  .create-form .btn-ctn {
    display: flex;
    justify-content: space-around;
    margin: 2rem auto;
  }
</style>

<section>
  <form class="search-form" novalidate>
    <i class="material-icons search-icon">search</i>
    <Input type="search" label="Search Exercises" name="exercises" />
  </form>
  <h1>your exercises</h1>
  <Button
    size="big"
    variant="filled"
    color="action"
    on:click={onCreateExercise}>
    <i class="material-icons">add</i>
    Add new exercise
  </Button>
  <ul>
    {#each exercises as exercise (exercise)}
      <li>
        <CardExercise exerciseName={exercise} />
      </li>
    {/each}
  </ul>
  {#if $exercisesState.matches('creating')}
  <!-- @TODO autofocus input on modal open, only allow close click on overlay, validate input before create -->
    <ModalLayout on:click={onDiscard}>
      <form class="create-form" novalidate>
        <Input
          name="exerciseName"
          label="Exercise Name"
          on:input={onNewExerciseInput} />
        <div class="btn-ctn">
          <Button color="error" variant="filled" on:click={onDiscard}>
            Discard
          </Button>
          <Button color="action" variant="filled" on:click={onCreate}>
            Create
          </Button>
        </div>
      </form>
    </ModalLayout>
  {/if}
</section>
