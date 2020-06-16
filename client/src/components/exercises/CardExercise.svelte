<script>
  // Svelte
  import { createEventDispatcher } from "svelte";
  import { goto } from "@sveltech/routify";

  // Components
  import Ripple from "@/components/UI/Ripple.svelte";
  import Input from "@/components/UI/Input.svelte";

  const dispatch = createEventDispatcher();

  export let exercise;
  export let editService;

  function onSeeHistory() {
    $goto(`/exercises/${exercise._id}`);
  }

  function onDelete() {
    dispatch("delete", exercise);
  }

  function onEdit() {
    dispatch("edit", exercise);
  }

  function onSave() {
    editService.send({ type: "SAVE" });
  }

  function onDiscard() {
    editService.send({ type: "DISCARD" });
  }

  function onInput(e) {
    editService.send({ type: "INPUT", params: { name: e.target.value } });
  }
</script>

<style>
  article {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 50rem;
    margin: 1rem auto;
    padding: 1rem;
    border-radius: var(--radius-default);
    background-color: var(--color-fg-light);
    box-shadow: var(--shadow-default);
  }

  form {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  h3 {
    flex-basis: 60%;
    margin: 0;
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

  button.history {
    color: var(--color-info);
  }

  button.edit {
    color: var(--color-action);
  }

  button.delete {
    color: var(--color-error);
  }

  button.save {
    color: var(--color-action);
  }
</style>

<article>
  {#if editService && editService.state.context.exercise._id === exercise._id}
    <form novalidate on:submit|preventDefault={onSave}>
      <Input
        name="editExercise"
        label="Exercise Name"
        autofocus={true}
        value={exercise.name}
        on:input={onInput} />
      <div>
        <!-- Save btn -->
        <button class="save" type="submit">
          <i class="material-icons">done</i>
          <span class="screen-reader-text">Save</span>
          <Ripple />
        </button>
        <!-- Discard btn -->
        <button class="delete" on:click={onDiscard}>
          <i class="material-icons">cancel</i>
          <span class="screen-reader-text">Discard</span>
          <Ripple />
        </button>
      </div>
    </form>
  {:else}
    <h3>{exercise.name}</h3>
    <div>
      <!-- History btn -->
      <button class="history" on:click={onSeeHistory}>
        <i class="material-icons">bar_chart</i>
        <span class="screen-reader-text">See history</span>
        <Ripple />
      </button>
      <!-- Edit btn -->
      <button class="edit" on:click={onEdit}>
        <i class="material-icons">edit</i>
        <span class="screen-reader-text">Edit</span>
        <Ripple />
      </button>
      <!-- Delete btn -->
      <button class="delete" on:click={onDelete}>
        <i class="material-icons">delete</i>
        <span class="screen-reader-text">Delete</span>
        <Ripple />
      </button>
    </div>
  {/if}
</article>
