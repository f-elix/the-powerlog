<script>
  // Svelte
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  // Components
  import Ripple from "@/components/UI/Ripple.svelte";
  import Input from "@/components/UI/Input.svelte";

  const dispatch = createEventDispatcher();

  export let exercise;
  export let editService;

  function onDelete() {
    dispatch("delete", exerciseId);
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

  h3 {
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

  button.edit {
    color: var(--color-info);
  }

  button.delete {
    color: var(--color-error);
  }

  button.save {
    color: var(--color-action);
  }

  button span {
    display: none;
  }
</style>

<article in:fly={{ x: 30 }} out:fly={{ x: 30, duration: 200 }}>
  {#if editService && editService.state.context.exercise._id === exercise._id}
    <Input
      name="editExercise"
      label="Exercise Name"
      value={exercise.name}
      on:input={onInput} />
  {:else}
    <h3>{exercise.name}</h3>
  {/if}
  {#if editService && editService.state.context.exercise._id === exercise._id}
    <div>
      <!-- Save btn -->
      <button class="save" on:click={onSave}>
        <i class="material-icons">done</i>
        <span>Save</span>
        <Ripple />
      </button>
      <!-- Discard btn -->
      <button class="delete" on:click={onDiscard}>
        <i class="material-icons">cancel</i>
        <span>Discard</span>
        <Ripple />
      </button>
    </div>
  {:else}
    <div>
      <!-- Edit btn -->
      <button class="edit" on:click={onEdit}>
        <i class="material-icons">edit</i>
        <span>Edit</span>
        <Ripple />
      </button>
      <!-- Delete btn -->
      <button class="delete" on:click={onDelete}>
        <i class="material-icons">delete</i>
        <span>Delete</span>
        <Ripple />
      </button>
    </div>
  {/if}
</article>
