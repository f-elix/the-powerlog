<script>
  // Svelte
  import { fly } from "svelte/transition";

  // Components
  import Ripple from "@/components/UI/Ripple.svelte";

  export let exerciseName;
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
  <h3>{exerciseName}</h3>
  <div>
    <!-- Edit btn -->
    <button class="edit">
      <i class="material-icons">edit</i>
      <span>Edit</span>
      <Ripple />
    </button>
    <!-- Delete btn -->
    <button class="delete">
      <i class="material-icons">delete</i>
      <span>Delete</span>
      <Ripple />
    </button>
  </div>
</article>
