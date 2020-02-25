<script>
  // Svelte
  import { slide, scale, fly } from "svelte/transition";
  import { expoInOut } from "svelte/easing";
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
    position: relative;
    /* overflow: hidden; */
  }
  .form-ctn {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
</style>

<div class="ctn">
  <!-- Sign up -->
  {#if $state.matches('idle.signup')}
    <div
      class="form-ctn"
      transition:fly={{y: -400}}>
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
    <!-- Login -->
  {:else if $state.matches('idle.login')}
    <div
      class="form-ctn"
      transition:fly={{y: -400}}>
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
  {/if}
</div>
