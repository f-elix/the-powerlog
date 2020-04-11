<script>
  // Svelte
  import { onMount, setContext } from "svelte";
  import { stores } from "@sapper/app";

  // FSM
  import { useMachine, useService } from "@/fsm/machineStores.js";
  import { templateMachine } from "@/fsm/templates/templateMachine.js";

  // Components
  import DisplayTemplate from "@/components/templates/DisplayTemplate.svelte";
  import EditTemplate from "@/components/templates/EditTemplate.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";

  const { page } = stores();
  const { _id } = $page.params;

  const { templateState, templateSend } = useMachine(templateMachine);

  $: if ($templateState.children.editTemplate) {
    const { editTemplateState, editTemplateSend } = useService(
      $templateState.children.editTemplate
    );
    setContext("editTemplate", {
      editTemplateState,
      editTemplateSend
    });
  }

  onMount(() => {
    templateSend({
      type: "LOAD",
      params: {
        templateId: _id
      }
    });
  });

  $: template = $templateState.context.template;

  function onDelete() {
    templateSend({ type: "DELETE" });
  }

  function onEdit() {
    templateSend({ type: "EDIT" });
  }

  function onDisplayOut() {
    templateSend({ type: "DISPLAY_OUT" });
  }

  function onEditOut() {
    templateSend({ type: "EDIT_OUT" });
  }
</script>

<style>
  .spinner-ctn {
    margin-top: 20rem;
  }
</style>

<!-- Loading spinner -->
{#if $templateState.matches('fetching')}
  <div class="spinner-ctn">
    <Spinner />
  </div>
{/if}
<!-- Display template -->
{#if $templateState.matches('displaying')}
  <DisplayTemplate
    {template}
    on:delete={onDelete}
    on:edit={onEdit}
    on:outroend={onDisplayOut} />
{/if}
<!-- Edit template -->
{#if $templateState.matches('editing')}
  <EditTemplate isNew={false} on:outroend={onEditOut} />
{/if}
