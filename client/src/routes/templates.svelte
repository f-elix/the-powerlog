<script>
  // Svelte
  import { onMount } from "svelte";
  import { flip } from "svelte/animate";

  // FSM
  //   import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import CardExercise from "@/components/exercises/CardExercise.svelte";
  import Button from "@/components/UI/Button.svelte";
  import Input from "@/components/UI/Input.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";
  import ModalLayout from "@/components/UI/ModalLayout.svelte";
  import SearchForm from "@/components/UI/SearchForm.svelte";
</script>

<style>
  h1 {
    text-transform: capitalize;
  }

  ul {
    margin: 2rem auto;
    list-style-type: none;
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

<section>
  <!-- Search form -->
  <SearchForm label="Search Templates" name="searchTemplates" />

  <h1>your templates</h1>

  <!-- Add button -->
  <Button size="big" variant="filled" color="action">
    <i class="material-icons">add</i>
    Add new template
  </Button>

  <!-- Templates list -->
  <ul>
    <!-- Spinner -->
    <!-- {#if $exercisesState.matches('fetching')} -->
    <!-- <Spinner /> -->
    <!-- No results message -->
    <!-- {:else if $exercisesState.context.fetchError} -->
    <!-- <h2 class="message">No templates created yet</h2> -->
    <!-- {/if} -->
    <!-- {#each exercises as exercise (exercise._id)} -->
    <li>
      <!-- @TODO card template -->
    </li>
    <!-- {/each} -->
  </ul>

  <!-- Modal -->
  <!-- {#if $exercisesState.matches('creating')} -->
  <!-- <ModalLayout> -->
  <!-- Error message -->
  <!-- {#if $exercisesState.context.fetchError} -->
  <!-- <p class="message error">Fetch error</p> -->
  <!-- {/if} -->
  <!-- Exercise form -->
  <!-- <form class="create-form" novalidate>
    <Input autofocus={true} name="exerciseName" label="Exercise Name" />
    <div class="btn-ctn">
      <Button color="error" variant="filled">Discard</Button>
      <Button color="action" variant="filled" type="submit">Create</Button>
    </div>
  </form> -->
  <!-- </ModalLayout> -->
  <!-- {/if} -->
</section>
