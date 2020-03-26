<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  // Components
  import Button from "@/components/UI/Button.svelte";
  import ModalLayout from "@/components/UI/ModalLayout.svelte";

  const dispatch = createEventDispatcher();

  function onCancel() {
    dispatch("cancel");
  }
</script>

<style>
  .btn-ctn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 2rem;
  }
</style>

<ModalLayout on:click={onCancel}>
  <form on:submit|preventDefault novalidate>
    <slot />
    <!-- actions btn -->
    <div class="btn-ctn">
      <Button variant="filled" color="error" on:click={onCancel}>
        <i class="material-icons">close</i>
        Cancel
      </Button>
      <Button variant="filled" color="action" type="submit">
        <i class="material-icons">done</i>
        Done
      </Button>
    </div>
  </form>
</ModalLayout>
