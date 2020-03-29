<script>
  // svelte
  import { setContext } from "svelte";

  // fsm
  import { editTemplateMachine } from "@/fsm/templates/editTemplateMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import EditTemplate from "@/components/templates/EditTemplate.svelte";

  const { editTemplateState, editTemplateSend } = useMachine(
    editTemplateMachine
  );

  setContext("editTemplate", {
    editTemplateState,
    editTemplateSend
  });
</script>

<EditTemplate />
