<script>
  // Svelte
  import { onMount } from "svelte";

  //   FSM
  import { authMachine } from "@/fsm/auth/authMachine.js";
  import { searchMachine } from "@/fsm/search/searchMachine.js";
  import { useMachine } from "@/fsm/useMachine.js";

  // Components
  import ModuleSearchSessions from "@/components/log/ModuleSearchSessions.svelte";
  import ModuleSearchFilters from "@/components/log/ModuleSearchFilters.svelte";

  const { searchState, searchSend } = useMachine(searchMachine);

  onMount(() => {});
</script>

<style>

</style>

<ModuleSearchFilters />
<ModuleSearchSessions />
