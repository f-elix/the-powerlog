<script>
  // FSM
  import { formMachine } from "@/fsm/formMachine.js";
  import { useMachine } from "@/fsm/useMachine.js";

  // js
  import { requiredPasswordLength } from "@/assets/js/utils.js";

  // Components
  import Input from "../UI/Input.svelte";
  import Button from "../UI/Button.svelte";

  const { state, send } = useMachine(formMachine);

  let nameError = "";
  let emailError = "";
  let passwordError = "";

  $: nameError = $state.matches('idle.name.invalid.empty') ? "Name is required." : "";
  $: if ($state.matches('idle.email.invalid.empty')) {
    emailError = "Email is required.";
  } else if ($state.matches('idle.email.invalid.badFormat')) {
    emailError = "Please provide a valid email.";
  } else {
    emailError = "";
  }
  $: if ($state.matches('idle.password.invalid.empty')) {
    passwordError = "Password is required.";
  } else if ($state.matches('idle.password.invalid.tooShort')) {
    passwordError = "Password must have at least " + requiredPasswordLength + " characters.";
  } else {
    passwordError = "";
  }
</script>

<form class="auth-form" on:submit|preventDefault={e => send({type: 'SUBMIT'})} novalidate>
  <!-- Name -->
  <Input
    name="name"
    label="Name"
    value={$state.context.name}
    errorMessage={nameError}
    on:input={e => send({
        type: 'INPUT_NAME',
        params: { value: e.target.value }
      })} />
  <!-- Email -->
  <Input
    type="email"
    name="email"
    label="Email"
    value={$state.context.email}
    errorMessage={emailError}
    on:input={e => send({
        type: 'INPUT_EMAIL',
        params: { value: e.target.value }
      })} />
  <!-- Password -->
  <Input
    type="password"
    name="password"
    label="Password"
    value={$state.context.password}
    errorMessage={passwordError}
    on:input={e => send({
        type: 'INPUT_PASSWORD',
        params: { value: e.target.value }
      })} />
  <Button size="big" color="info" type="submit">Sign Up</Button>
</form>
