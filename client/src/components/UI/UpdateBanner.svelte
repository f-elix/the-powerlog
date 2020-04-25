<script>
  // Components
  import Button from "@/components/UI/Button.svelte";
</script>

<style>
  .banner {
    display: none;
    position: fixed;
    z-index: 1000;
    top: 0;
    width: 100%;
    padding: 0.25rem 0;
    text-align: center;
    background-color: var(--color-fg);
  }

  .banner p {
    font-size: 1.25rem;
  }

  .banner p strong {
    color: var(--color-info);
  }

  .btn-ctn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 75%;
    margin: 2rem auto;
  }
</style>

<aside id="update-banner" class="banner">
  <p>
    There's a new version of
    <strong>The Power Log</strong>
    .
    <br />
    Simply reload the app to access it.
  </p>
  <div class="btn-ctn">
    <Button color="error" variant="filled" id="dismiss-button">Dismiss</Button>
    <Button color="action" variant="filled" id="update-button">Reload</Button>
  </div>
</aside>
