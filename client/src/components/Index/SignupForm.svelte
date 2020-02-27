<script>
  // Svelte
  import { getContext } from "svelte";

  // Components
  import Input from "../UI/Input.svelte";
  import Button from "../UI/Button.svelte";

  const { validationState, validationSend } = getContext("validation");
</script>

<form
  class="auth-form"
  on:submit|preventDefault={() => validationSend({ type: 'SUBMIT_SIGNUP' })}
  novalidate>
  <!-- Name -->
  <Input
    name="name"
    label="Name"
    value={$validationState.context.name}
    errorMessage={$validationState.context.nameError}
    on:input={e => validationSend({
        type: 'INPUT_NAME',
        params: { value: e.target.value }
      })} />
  <!-- Email -->
  <Input
    type="email"
    name="email"
    label="Email"
    value={$validationState.context.email}
    errorMessage={$validationState.context.emailError}
    on:input={e => validationSend({
        type: 'INPUT_EMAIL',
        params: { value: e.target.value }
      })} />
  <!-- Password -->
  <Input
    type="password"
    name="password"
    label="Password"
    value={$validationState.context.password}
    errorMessage={$validationState.context.passwordError}
    on:input={e => validationSend({
        type: 'INPUT_PASSWORD',
        params: { value: e.target.value }
      })} />
  <Button size="big" color="info" type="submit">Sign Up</Button>
</form>
