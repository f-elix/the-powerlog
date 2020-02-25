<script>
  import Button from "@/components/UI/Button.svelte";
  import Input from "@/components/UI/Input.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";
  import AppLoader from "@/components/UI/AppLoader.svelte";
  import FormBox from "@/components/index/FormBox.svelte";
</script>

<style>
  section {
    margin-top: 8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
</style>

<section>
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

  <!-- Forms -->
  <FormBox />
</section>
