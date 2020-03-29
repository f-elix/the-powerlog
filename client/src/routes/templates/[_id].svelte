<script>
  // Svelte
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";

  // FSM
  import { useMachine } from "@/fsm/machineStores.js";
  import { templateMachine } from "@/fsm/templates/templateMachine.js";

  // Components
  import Spinner from "@/components/UI/Spinner.svelte";

  const { page } = stores();
  const { _id } = $page.params;

  const { templateState, templateSend } = useMachine(templateMachine);

  let template;

  $: template = $templateState.context.template;

  $: console.log(template);

  onMount(() => {
    templateSend({
      type: "LOAD",
      params: {
        templateId: _id
      }
    });
  });
</script>

{#if $templateState.matches('fetching')}
  <Spinner />
{/if}
{#if $templateState.matches('success')}
  <h1>{template.name}</h1>
{/if}
