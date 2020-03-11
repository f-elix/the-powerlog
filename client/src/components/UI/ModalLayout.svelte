<script>
  // Svelte
  import { scale, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
</script>

<style>
  .overlay {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 15rem;
    background-color: rgba(0, 0, 0, 0.9);
  }

  .modal {
    z-index: 1001;
    width: 80%;
    max-width: 30rem;
    padding: 1rem;
    background-color: var(--color-fg-light);
    border-radius: var(--radius-default);
    box-shadow: var(--shadow-default);
  }
</style>

<div class="overlay" transition:fade={{ duration: 200 }} on:click>
  <div class="modal" transition:scale={{ easing: quintOut, opacity: 0 }}>
    <slot />
  </div>
</div>
