<script>
  // FSM
  import { useMachine } from "@/fsm/machineStores.js";
  import { templateMachine } from "@/fsm/templates/templateMachine.js";

  const { editTemplateState, editTemplateSend } = useMachine(templateMachine);
</script>

<h1>Edit template</h1>
