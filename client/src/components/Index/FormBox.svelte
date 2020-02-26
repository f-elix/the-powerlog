<script>
  // Svelte
  import { fly, slide, blur, scale } from "svelte/transition";
  import { expoOut } from "svelte/easing";
  // Components
  import SignupForm from "./SignupForm.svelte";
  import LoginForm from "./LoginForm.svelte";
  import Button from "../UI/Button.svelte";
  // FSM
  import { useMachine } from "@/fsm/useMachine.js";
  import { authMachine } from "@/fsm/authMachine.js";

  const { state, send } = useMachine(authMachine);

  const forms = [
    {
      state: "idle.signup",
      bottomText: "Already have an account?",
      buttonEvent: { type: "LOGIN" },
      buttonLabel: "Login here",
      component: SignupForm
    },
    {
      state: "idle.login",
      bottomText: "Don't have an account yet?",
      buttonEvent: { type: "SIGNUP" },
      buttonLabel: "Sign up here",
      component: LoginForm
    }
  ];
</script>

<style>
  .ctn {
    width: 100%;
    height: 44rem;
    position: relative;
    overflow: hidden;
  }

  .form-ctn {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .signup {
    padding: 0 1rem;
    background-color: var(--color-fg);
    border-radius: var(--radius-default);
  }
</style>

<div class="ctn">
  {#if $state.matches('idle.displayLogin')}
    <!-- Login -->
    <div
      class="form-ctn"
      in:scale={{ y: -450, delay: 500, easing: expoOut, duration: 600, opacity: 0 }}
      out:scale={{ y: -450, easing: expoOut, duration: 600, opacity: 0 }}>
      <LoginForm />
      <p>Don't have an account yet?</p>
      <Button
        size="big"
        variant="filled"
        color="info"
        on:click={() => send({ type: 'SIGNUP' })}>
        Sign up here
      </Button>
    </div>
  {:else if $state.matches('idle.displaySignup')}
    <!-- Sign up -->
    <div
      class="form-ctn signup"
      in:fly={{ y: -450, delay: 500, easing: expoOut, duration: 600, opacity: 0 }}
      out:fly={{ y: -450, easing: expoOut, duration: 600, opacity: 0 }}>
      <SignupForm />
      <p>Already have an account?</p>
      <Button
        size="big"
        variant="filled"
        color="info"
        on:click={() => send({ type: 'LOGIN' })}>
        Login here
      </Button>
    </div>
  {/if}
</div>
