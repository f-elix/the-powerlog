<script>
  // Svelte
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import { goto } from "@sveltech/routify";

  // FSM
  import { useMachine } from "@/fsm/machineStores.js";
  import { authMachine } from "@/fsm/auth/authMachine.js";

  // Components
  import Header from "@/components/layout/Header.svelte";
  import UpdateBanner from "@/components/UI/UpdateBanner.svelte";

  const { authState, authSend } = useMachine(
    authMachine.withConfig({
      actions: {
        routeDashboard: () => $goto("/dashboard"),
        routeAuth: () => $goto("/")
      }
    })
  );

  setContext("auth", {
    authState,
    authSend
  });
</script>

<style>
  main {
    padding-bottom: calc(var(--header-height) + 2rem);
  }
</style>

<UpdateBanner />
{#if $authState.matches('authenticated')}
  <Header />
{/if}
<main>
  <slot />
</main>
