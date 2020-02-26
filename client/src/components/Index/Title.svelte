<script>
  import Button from "../UI/Button.svelte";
</script>

<style>
  .title {
    height: 47.5%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 1rem;
  }

  h2 {
    margin-bottom: 3rem;
  }
</style>

<div class="title">
  <!-- Logo -->
  <img src="/img/icons/icon.svg" alt="" width="144" height="144" />

  <!-- Title -->
  <h1>The Strength Log</h1>
  <h2>
    Log your training,
    <br />
    Get the Results.
  </h2>

  <!-- Install btn -->
  <Button variant="filled" color="primary-30">
    <i class="material-icons">save_alt</i>
    Install
  </Button>
</div>
