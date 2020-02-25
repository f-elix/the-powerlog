<script>
  import { onMount } from "svelte";
  import Ripple from "./Ripple.svelte";

  let btn;

  let outlinedColor;

  export let size = "small";
  export let color = "primary";
  export let variant = "outlined";
  export let type = "button";
  export let position = "bottom-right";
</script>

<style>
  button {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    background: none;
    letter-spacing: 0.15rem;
    border-radius: var(--radius-default);
    color: var(--color-primary);
    cursor: pointer;
    outline: none;
    box-shadow: var(--shadow-default);
  }

  .outlined {
    border: var(--border-default) var(--theme);
  }

  .outlined:hover {
    background-color: var(--color-primary-10);
  }

  .outlined:focus {
    background-color: var(--color-primary-30);
  }

  .filled {
    background-color: var(--theme);
  }

  .filled:hover .filled-overlay {
    background-color: var(--color-primary-10);
  }

  .filled:focus .filled-overlay {
    background-color: var(--color-primary-30);
  }

  .filled-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .small {
    padding: 0.6rem;
    font-size: var(--text-small);
    width: 10rem;
    text-transform: uppercase;
  }

  .big {
    padding: 1rem;
    font-size: var(--text-big);
    min-width: 20rem;
    width: 100%;
    text-transform: capitalize;
  }

  .fab {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
  }

  .fab.bottom-center {
    position: fixed;
    bottom: 10%;
    left: 50%;
    right: 50%;
  }

  .fab.bottom-left {
    position: fixed;
    bottom: 10%;
    left: 10%;
  }

  .fab.bottom-right {
    position: fixed;
    bottom: 10%;
    right: 10%;
  }
</style>

<button
  on:click
  bind:this={btn}
  {type}
  class="{size}
  {variant}
  {position}"
  style="--theme: var(--color-{color})">
  {#if variant === 'filled'}
    <div class="filled-overlay" />
  {/if}
  <Ripple />
  <slot />
</button>
