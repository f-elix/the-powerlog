<script>
  import Ripple from "./Ripple.svelte";
  export let type = "text";
  export let value = "";
  export let label = "";
  export let name = "";
  export let placeholder = " ";
</script>

<style>
  label {
    --padding: 0.6rem;
    position: relative;
    display: block;
    max-width: 40rem;
    margin: 1rem auto;
    font-size: var(--text-normal);
    cursor: text;
  }

  input {
    width: 100%;
    padding: var(--padding);
    background: none;
    color: var(--color-primary);
    outline: none;
    border: none;
    border-bottom: var(--border-thin);
    border-bottom-color: var(--color-greyedout);
    border-top-right-radius: var(--radius-default);
    border-top-left-radius: var(--radius-default);
    transition: background-color 0.2s;
  }

  label:hover input {
    border-bottom-color: var(--color-primary);
  }

  label:focus-within input {
    background-color: var(--color-fg-light);
  }

  .label {
    position: absolute;
    left: var(--padding);
    top: 1rem;
    color: var(--color-primary);
    transition: transform 0.2s, color 0.2s;
  }

  label:focus-within .label,
  input:not(:placeholder-shown) + .label {
    transform: translate(calc(var(--padding) * -1), -50%) scale(0.75);
    color: var(--color-greyedout);
  }

  .underline {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--color-primary);
    transition: transform 0.2s ease-out, opacity 0.05s;
    transform: scaleX(0);
    opacity: 0;
  }

  label:focus-within .underline {
    transform: scaleX(1);
    opacity: 1;
  }

  .label-padding {
    padding: calc(var(--padding) * 3) var(--padding) var(--padding);
  }
</style>

<label>
  <input {type} {value} {name} class:label-padding={label} {placeholder} />
  <span class="label">{label}</span>
  <div class="underline" />
  <Ripple />
</label>
