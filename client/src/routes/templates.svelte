<script>
  // Svelte
  import { onMount } from "svelte";
  import { flip } from "svelte/animate";

  // FSM
  //   import { exercisesMachine } from "@/fsm/exercises/exercisesMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import TemplateForm from "@/components/templates/TemplateForm.svelte";
  import CardTemplate from "@/components/templates/CardTemplate.svelte";
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
</style>

<section>
  <h1>your templates</h1>

  <!-- Search form -->
  <SearchForm label="Search Templates" name="searchTemplates" />

  <!-- Add button -->
  <Button size="big" variant="filled" color="action">
    <i class="material-icons">add</i>
    Add new
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
      <CardTemplate />
    </li>
    <!-- {/each} -->
  </ul>

  <!-- Modal -->
  <ModalLayout size="big">
    <TemplateForm />
  </ModalLayout>
</section>
