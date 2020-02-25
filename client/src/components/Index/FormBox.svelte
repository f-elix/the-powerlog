<script>
  // Svelte
  import { slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  // Components
  import SignupForm from "./SignupForm.svelte";
  import LoginForm from "./LoginForm.svelte";
  import Button from "../UI/Button.svelte";
  // FSM
  import { useMachine } from "@/fsm/useMachine.js";
  import { authMachine } from "@/fsm/authMachine.js";

  const { state, send } = useMachine(authMachine);
</script>

<style>
  div {
    width: 100%;
    /* position: absolute; */
  }
</style>

<!-- Login -->
{#if $state.matches('idle.login')}
  <div transition:slide>
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

<!-- Sign up -->
{#if $state.matches('idle.signup')}
  <div transition:slide>
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
