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

  .cancel-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    color: var(--color-error);
    line-height: 1;
    font-size: var(--text-big);
  }
</style>

<ModalLayout on:click={onCancel}>
  <button class="cancel-btn" on:click={onCancel}>
    <i class="material-icons">cancel</i>
  </button>
  <form on:submit|preventDefault novalidate>
    <slot />
    <!-- actions btn -->
    <div class="btn-ctn">
      <Button variant="filled" size="big" color="action" type="submit">
        <i class="material-icons">done</i>
        Done
      </Button>
    </div>
  </form>
</ModalLayout>
