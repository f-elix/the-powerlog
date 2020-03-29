<script>
  // Svelte
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  // Components
  import Ripple from "@/components/UI/Ripple.svelte";

  const dispatch = createEventDispatcher();

  export let template;

  function onDelete() {
    dispatch("delete", template._id);
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

  button span {
    display: none;
  }

  button.edit {
    color: var(--color-info);
  }

  button.delete {
    color: var(--color-error);
  }
</style>

<article in:fly|local={{ x: 30 }} out:fly|local={{ x: 30, duration: 200 }}>
  <h3>{template.name}</h3>
  <div>
    <!-- View template btn -->
    <button class="edit">
      <i class="material-icons">visibility</i>
      <span>View Template</span>
      <Ripple />
    </button>
    <!-- Delete btn -->
    <button class="delete" on:click={onDelete}>
      <i class="material-icons">delete</i>
      <span>Delete</span>
      <Ripple />
    </button>
  </div>
</article>
