<script>
  export let state = "closed";
</script>

<style>
  button {
    position: relative;
    z-index: 10;
    width: 3rem;
    height: 3rem;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
  }

  .hamburger {
    position: absolute;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: var(--color-primary);
    transition: transform 0.2s ease-out, opacity 0.2s;
  }

  .hamburger::before,
  .hamburger::after {
    content: "";
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: inherit;
    transition: inherit;
  }

  .hamburger::before {
    top: -1rem;
  }

  .hamburger::after {
    top: 1rem;
  }

  :global(.menu-btn[data-state="open"] .hamburger) {
    transform: rotate(45deg);
  }

  :global(.menu-btn[data-state="open"] .hamburger::before) {
    transform: translateY(1rem);
    opacity: 0;
  }

  :global(.menu-btn[data-state="open"] .hamburger::after) {
    transform: translateY(-1rem) rotate(-90deg);
  }
</style>

<button class="menu-btn" data-state={state} on:click>
  <div class="hamburger" />
</button>
