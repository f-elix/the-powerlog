<script>
  export let label = "";
  export let name = "";
  export let options = [];
  export let selected = options[0];
  export let disabled = false;
</script>

<style>
  label {
    display: block;
    font-size: var(--text-normal);
  }

  select {
    width: 100%;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-default);
    border: var(--border-thin) var(--color-primary);
    background-color: var(--color-fg-dark);
    color: var(--color-primary);
    text-transform: capitalize;
  }

  option {
    text-transform: capitalize;
  }

  .disabled {
    user-select: none;
    pointer-events: none;
    opacity: 0.5;
  }
</style>

<label>
  {label}
  <select class:disabled {name} bind:value={selected} on:change>
    {#each options as option (option)}
      <option value={option}>{option}</option>
    {/each}
  </select>
</label>
