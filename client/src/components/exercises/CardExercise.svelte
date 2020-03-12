<script>
  // Svelte
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  // Components
  import Ripple from "@/components/UI/Ripple.svelte";
  import Input from "@/components/UI/Input.svelte";

  const dispatch = createEventDispatcher();

  export let exerciseName;
  export let exerciseId;

  let isEditing = false;

  function onDelete() {
    dispatch("delete", exerciseId);
  }

  function onEdit() {
    isEditing = true;
  }

  function onSave() {
    isEditing = false;
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

  button span {
    display: none;
  }
</style>

<article in:fly={{ x: 30 }}>
  {#if !isEditing}
    <h3>{exerciseName}</h3>
  {:else}
    <Input name="editExercise" label="Exercise Name" value={exerciseName} />
  {/if}
  <div>
    {#if !isEditing}
      <!-- Edit btn -->
      <button class="edit" on:click={onEdit}>
        <i class="material-icons">edit</i>
        <span>Edit</span>
        <Ripple />
      </button>
    {:else}
      <!-- Save btn -->
      <button class="save" on:click={onSave}>
        <i class="material-icons">save</i>
        <span>Save</span>
        <Ripple />
      </button>
    {/if}
    <!-- Delete btn -->
    <button class="delete" on:click={onDelete}>
      <i class="material-icons">delete</i>
      <span>Delete</span>
      <Ripple />
    </button>
  </div>
</article>
