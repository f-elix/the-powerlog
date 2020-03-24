<script>
  // svelte
  import { goto } from "@sapper/app";
  import { setContext } from "svelte";

  // fsm
  import { editTemplateMachine } from "@/fsm/templates/editTemplateMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import TemplateForm from "@/components/templates/TemplateForm.svelte";
  import AddExerciseModal from "@/components/templates/AddExerciseModal.svelte";
  import AddSetModal from "@/components/templates/AddSetModal.svelte";

  const { editTemplateState, editTemplateSend } = useMachine(
    editTemplateMachine
  );

  setContext("editTemplate", {
    editTemplateState,
    editTemplateSend
  });

  $: console.log($editTemplateState.children);

  function onCancel() {
    goto("/templates");
  }

  function onNameInput(e) {
    editTemplateSend({ type: "NAME_INPUT", params: { value: e.detail } });
  }

  function onAddExercise() {
    editTemplateSend({ type: "ADD_EXERCISE" });
  }
</script>

<style>
  .template-btn-ctn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 80%;
    margin: 0 auto;
    padding: 3rem 1rem;
  }
</style>

<!-- Header -->
<h1>Create a Template</h1>
<!-- Template form -->
<TemplateForm on:nameinput={onNameInput} on:addexercise={onAddExercise} />
<!-- Add exercise modal -->
{#if $editTemplateState.matches('addingexercise')}
  <AddExerciseModal />
{/if}
<!-- Add set modal -->
{#if $editTemplateState.matches('addingset')}
  <AddSetModal />
{/if}
<!-- Template buttons -->
<div class="template-btn-ctn">
  <Button color="error" variant="filled" on:click={onCancel}>Cancel</Button>
  <Button color="action" variant="filled">Create</Button>
</div>
