<script>
  export let state = "closed";
</script>

<style>
  .drawer {
    position: absolute;
    right: -100%;
    width: 100%;
    height: 100rem;
    background-color: var(--color-fg-light);
    transition: transform 0.2s ease-out;
  }

  :global(.drawer[data-state="open"]) {
    transform: translateX(-100%);
  }
</style>

<nav class="drawer" data-state={state}>
  <slot />
</nav>
