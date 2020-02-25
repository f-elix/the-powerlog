<script>
  import FormLayout from "./FormLayout.svelte";
  import Input from "../UI/Input.svelte";
  import Button from "../UI/Button.svelte";

  export let name = "";
  export let email = "";
  export let password = "";
</script>

<FormLayout>
  <!-- Name -->
  <Input name="name" label="Name" bind:value={name} />
  <!-- Email -->
  <Input type="email" name="email" label="Email" bind:value={email} />
  <!-- Password -->
  <Input
    type="password"
    name="password"
    label="Password"
    bind:value={password} />
  <Button size="big" color="info">Sign Up</Button>
</FormLayout>
