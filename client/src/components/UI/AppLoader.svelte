<script>
  import { fade } from "svelte/transition";
</script>

<style>
  .dimmer {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--color-dimmer);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  @keyframes donut-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .donut {
    display: block;
    border: 8px solid var(--color-primary);
    border-left-color: var(--color-bg);
    border-radius: 50%;
    width: 10rem;
    height: 10rem;
    animation: donut-spin 1.2s linear infinite;
  }
</style>

<div class="dimmer" transition:fade={{ duration: 200 }}>
  <div class="donut" />
</div>
