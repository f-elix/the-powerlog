<script>
  // Svelte
  import { scale, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  export let size = "small";
</script>

<style>
  .modal-ctn {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
  }

  .modal {
    z-index: 1001;
    background-color: var(--color-fg-light);
    box-shadow: var(--shadow-default);
  }

  .small {
    width: 80%;
    max-width: 30rem;
    margin-top: 15rem;
    padding: 1rem;
    border-radius: var(--radius-default);
  }

  .big {
    width: 100%;
    max-width: 40rem;
    margin-top: 6rem;
  }
</style>

<div class="modal-ctn">
  <div class="overlay" transition:fade={{ duration: 200 }} on:click />
  <div class="modal {size}" transition:scale={{ easing: quintOut, opacity: 0 }}>
    <slot />
  </div>
</div>
