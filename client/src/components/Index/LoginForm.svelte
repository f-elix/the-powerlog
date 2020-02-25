<script>
  import FormLayout from "./FormLayout.svelte";
  import Input from "../UI/Input.svelte";
  import Button from "../UI/Button.svelte";

  export let email = "";
  export let password = "";
</script>

<style>

</style>

<FormLayout>
  <!-- Email -->
  <Input type="email" name="email" label="Email" bind:value={email} />
  <!-- Password -->
  <Input
    type="password"
    name="password"
    label="Password"
    bind:value={password} />
  <Button size="big" color="info">Login</Button>
</FormLayout>
