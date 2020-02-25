<script>
  // Svelte
  import { fly } from "svelte/transition";
  import { expoInOut } from "svelte/easing";
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
  .formbox {
    width: 100%;
  }
</style>

<!-- Sign up -->
{#if $state.matches('idle.signup')}
  <div
    class="formbox"
    in:fly={{ y: -300, delay: 600 }}
    out:fly={{ y: -300, duration: 400 }}>
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
    class="formbox"
    in:fly={{ y: -300, delay: 600 }}
    out:fly={{ y: -300, duration: 400 }}>
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
