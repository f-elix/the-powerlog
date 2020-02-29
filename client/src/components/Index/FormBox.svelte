<script>
  // Svelte
  import { getContext, setContext } from "svelte";
  import { fly, scale, fade } from "svelte/transition";
  import { expoOut } from "svelte/easing";

  // FSM
  import { useMachine } from "@/fsm/useMachine.js";
  import { useService } from "@/fsm/useService.js";
  import { formboxMachine } from "@/fsm/auth/formboxMachine.js";
  import { validationMachine } from "@/fsm/auth/validationMachine.js";

  // Components
  import SignupForm from "./SignupForm.svelte";
  import LoginForm from "./LoginForm.svelte";
  import Button from "../UI/Button.svelte";

  const { formboxState, formboxSend } = useMachine(formboxMachine);

  const { authState, authSend } = getContext("auth");

  const { validationState, validationSend } = useService(
    $authState.context.validation
  );

  setContext("validation", {
    validationState,
    validationSend
  });

  function clearAuthError() {
    authSend({ type: "CLEAR_ERROR" });
  }

  function onSignUpClick() {
    formboxSend({ type: "SIGNUP" });
    clearAuthError();
  }

  function onLoginClick() {
    formboxSend({ type: "LOGIN" });
    clearAuthError();
  }
</script>

<style>
  .ctn {
    width: 100%;
    height: 44rem;
    overflow: hidden;
  }

  .form-ctn {
    width: 100%;
    height: 100%;
  }

  .auth-error {
    margin-bottom: 0;
    color: var(--color-error);
    text-align: center;
    font-weight: bold;
  }

  .signup {
    padding: 0 1rem;
    background-color: var(--color-fg);
    border-radius: var(--radius-default);
  }
</style>

{#if $authState.context.authError}
  <p class="auth-error">{$authState.context.authError}</p>
{/if}
<div class="ctn" transition:fade={{ duration: 200 }}>
  {#if $formboxState.matches('displayLogin')}
    <!-- Login -->
    <div
      class="form-ctn"
      in:scale={{ y: -450, easing: expoOut, opacity: 0 }}
      out:scale={{ y: -450, easing: expoOut, opacity: 0 }}
      on:outroend={() => formboxSend({ type: 'LOGIN_TRANSITIONEND' })}>
      <LoginForm />
      <p>Don't have an account yet?</p>
      <Button size="big" variant="filled" color="info" on:click={onSignUpClick}>
        Sign up here
      </Button>
    </div>
  {:else if $formboxState.matches('displaySignup')}
    <!-- Sign up -->
    <div
      class="form-ctn signup"
      in:fly={{ y: -450, easing: expoOut, opacity: 0 }}
      out:fly={{ y: -450, easing: expoOut, opacity: 0 }}
      on:outroend={() => formboxSend({ type: 'SIGNUP_TRANSITIONEND' })}>
      <SignupForm />
      <p>Already have an account?</p>
      <Button size="big" variant="filled" color="info" on:click={onLoginClick}>
        Login here
      </Button>
    </div>
  {/if}
</div>
