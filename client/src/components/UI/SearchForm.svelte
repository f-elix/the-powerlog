<script>
  // Components
  import Input from "@/components/UI/Input.svelte";

  export let name = "";
  export let label = "";
</script>

<style>
  .search-form {
    position: relative;
    margin: 2rem auto;
  }

  .search-form .search-icon {
    position: absolute;
    top: 20%;
    right: 5%;
    z-index: 10;
  }
</style>

<form class="search-form" on:submit|preventDefault novalidate>
  <i class="material-icons search-icon">search</i>
  <Input type="search" {label} {name} on:input />
</form>
