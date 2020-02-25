<script>
  import Ripple from "./Ripple.svelte";

  export let type = "text";
  export let value = "";
  export let label = "";
  export let name = "";
  export let placeholder = " ";
  export let cols = 20;
  export let rows = 5;
  export let error = true;
  export let errorMessage = "";

  function onInput(e) {
    value = e.target.value;
  }
</script>

<style>
  label {
    --padding: 0.6rem;
    position: relative;
    display: block;
    max-width: 40rem;
    font-size: var(--text-normal);
    cursor: text;
  }

  input,
  textarea {
    width: 100%;
    padding: var(--padding);
    background: none;
    color: var(--color-primary);
    outline: none;
    transition: background-color 0.2s;
  }

  input {
    border: none;
    border-bottom: var(--border-thin);
    border-bottom-color: var(--color-greyedout);
    border-top-right-radius: var(--radius-default);
    border-top-left-radius: var(--radius-default);
  }

  textarea {
    border: var(--border-thin) var(--color-greyedout);
    border-radius: var(--radius-default);
    transition: box-shadow 0.2s;
  }

  label:hover input,
  label:hover textarea {
    border-color: var(--color-primary);
  }

  label:focus-within input,
  label:focus-within textarea {
    background-color: var(--color-fg-light);
  }

  label:focus-within textarea {
    box-shadow: inset 0 0 0 2px var(--color-primary);
  }

  .label {
    position: absolute;
    left: var(--padding);
    top: 1rem;
    color: var(--color-primary);
    transition: transform 0.2s, color 0.2s;
  }

  .label.textarea-label {
    top: 1.6rem;
  }

  label:focus-within .label,
  input:not(:placeholder-shown) + .label,
  textarea:not(:placeholder-shown) + .label {
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

  .label-padding-textarea {
    padding: calc(var(--padding) * 4) var(--padding) var(--padding);
  }

  .error-message {
    margin: 0;
    font-size: var(--text-small);
    color: var(--color-error);
  }
</style>

<label>
  {#if type !== 'textarea'}
    <input
      {type}
      {name}
      class:label-padding={label}
      {placeholder}
      {value}
      on:input={onInput} />
    <span class="label">{label}</span>
    <div class="underline" />
  {:else}
    <textarea
      {name}
      {cols}
      {rows}
      {value}
      class:label-padding-textarea={label}
      {placeholder} />
    <span class="label textarea-label">{label}</span>
  {/if}
</label>
{#if error && errorMessage}
  <p class="error-message">{errorMessage}</p>
{/if}
