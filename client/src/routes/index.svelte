<script>
  // Svelte
  import { setContext, onMount } from "svelte";
  import { fade } from "svelte/transition";

  // FSM
  import { useMachine } from "@/fsm/useMachine.js";
  import { authMachine } from "@/fsm/auth/authMachine.js";
  import { validationMachine } from "@/fsm/auth/validationMachine.js";

  // Components
  import Spinner from "@/components/UI/Spinner.svelte";
  import AppLoader from "@/components/UI/AppLoader.svelte";
  import FormBox from "@/components/index/FormBox.svelte";
  import Title from "@/components/index/Title.svelte";

  const { authState, authSend } = useMachine(authMachine);

  setContext("auth", {
    authState,
    authSend
  });
</script>

<style>
  section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    text-align: center;
  }
</style>

{#if $authState.matches('loading')}
  <AppLoader />
{/if}
{#if $authState.matches('idle')}
  <section transition:fade={{ duration: 200 }}>
    <!-- Title -->
    <Title />
    <!-- Forms -->
    <FormBox />
  </section>
{/if}
