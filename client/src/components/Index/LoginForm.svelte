<script>
  // Svelte
  import { getContext } from "svelte";

  // FSM
  import { useService } from "@/fsm/useService.js";

  // Components
  import Input from "../UI/Input.svelte";
  import Button from "../UI/Button.svelte";

  const { authState } = getContext("auth");
  const validationService = $authState.context.validation;
  const {validationState, validationSend} = useService(validationService);
</script>

<form
  class="auth-form"
  on:submit|preventDefault={() => validationSend({ type: 'SUBMIT_LOGIN' })}
  novalidate>
  <!-- Email -->
  <Input
    type="email"
    name="email"
    label="Email"
    errorMessage={$validationState.context.emailError}
    value={$validationState.context.email}
    on:input={e => validationSend({
        type: 'INPUT_EMAIL',
        params: { value: e.target.value }
      })} />
  <!-- Password -->
  <Input
    type="password"
    name="password"
    label="Password"
    errorMessage={$validationState.context.passwordError}
    value={$validationState.context.password}
    on:input={e => validationSend({
        type: 'INPUT_PASSWORD',
        params: { value: e.target.value }
      })} />
  <Button size="big" color="info" type="submit">Login</Button>
</form>
