<script>
  // Svelte
  import { getContext } from "svelte";
  import { fade } from "svelte/transition";

  // FSM
  import { useMachine } from "@/fsm/machineStores.js";
  import { authMachine } from "@/fsm/auth/authMachine.js";

  // Components
  import AppLoader from "@/components/UI/AppLoader.svelte";
  import FormBox from "@/components/index/FormBox.svelte";
  import Title from "@/components/index/Title.svelte";

  const { authState, authSend } = getContext("auth");
</script>

<style>
  section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    padding-top: 2rem;
    text-align: center;
  }
</style>

{#if $authState.matches('loading')}
  <AppLoader />
{/if}
{#if $authState.matches('idle')}
  <section transition:fade|local={{ duration: 200 }}>
    <!-- Title -->
    <Title />
    <!-- Forms -->
    <FormBox />
  </section>
{/if}
