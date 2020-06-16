<script>
  // Svelte
  import { getContext } from "svelte";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Ripple from "@/components/UI/Ripple.svelte";
  import EditFormModalLayout from "./EditFormModalLayout.svelte";

  const { editWorkoutState, editWorkoutSend } = getContext("editWorkout");

  export let templates;

  let selectedTemplateId;

  function onCancel() {
    editWorkoutSend({ type: "CANCEL" });
  }

  function onInput(e) {
    let option = document.querySelector(`option[value="${e.target.value}"]`);
    if (!option) return;
    selectedTemplateId = option.dataset.id;
  }

  function onSelectTemplate() {
    editWorkoutSend({
      type: "SELECT",
      params: {
        templateId: selectedTemplateId
      }
    });
  }
</script>

<EditFormModalLayout on:cancel={onCancel} on:submit={onSelectTemplate}>
  <h2>Select a template</h2>
  <Input
    label="Template"
    list="templates"
    autofocus={true}
    on:input={onInput} />
  <datalist id="templates">
    {#each templates as template}
      <option value={template.name} data-id={template._id} />
    {/each}
  </datalist>
</EditFormModalLayout>
