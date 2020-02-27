<script>
  // Svelte
  import { setContext } from "svelte";
  import { fly, scale } from "svelte/transition";
  import { expoOut } from "svelte/easing";

  // FSM
  import { useMachine } from "@/fsm/useMachine.js";
  import { formboxMachine } from "@/fsm/auth/formboxMachine.js";
  import { validationMachine } from "@/fsm/auth/validationMachine.js";

  // Components
  import SignupForm from "./SignupForm.svelte";
  import LoginForm from "./LoginForm.svelte";
  import Button from "../UI/Button.svelte";

  const { formboxState, formboxSend } = useMachine(formboxMachine);

</script>

<style>
  .ctn {
    width: 100%;
    height: 44rem;
    overflow: hidden;
  }

  .form-ctn {
    width: 100%;
  }

  .signup {
    padding: 0 1rem;
    background-color: var(--color-fg);
    border-radius: var(--radius-default);
  }
</style>

<div class="ctn">
  {#if $formboxState.matches('displayLogin')}
    <!-- Login -->
    <div
      class="form-ctn"
      in:scale={{ y: -450, easing: expoOut, opacity: 0 }}
      out:scale={{ y: -450, easing: expoOut, opacity: 0 }}
      on:outroend={() => formboxSend({ type: 'LOGIN_TRANSITIONEND' })}>
      <LoginForm />
      <p>Don't have an account yet?</p>
      <Button
        size="big"
        variant="filled"
        color="info"
        on:click={() => formboxSend({ type: 'SIGNUP' })}>
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
      <Button
        size="big"
        variant="filled"
        color="info"
        on:click={() => formboxSend({ type: 'LOGIN' })}>
        Login here
      </Button>
    </div>
  {/if}
</div>
