<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Ripple from "@/components/UI/Ripple.svelte";
  import EditFormModalLayout from "./EditFormModalLayout.svelte";

  const dispatch = createEventDispatcher();

  export let exercises;
  export let isEditing = false;
  export let editedExercise;
  export let exerciseError = "";

  function onInput(e, id) {
    let exercise;
    const option = document.querySelector(`option[value="${e.target.value}"]`);
    if (option) {
      exercise = JSON.parse(option.dataset.exercise);
    } else {
      exercise = {
        name: e.target.value
      };
    }
    dispatch("exerciseinput", { movementId: id, exercise });
  }

  function onAddMovement() {
    dispatch("addmovement");
  }

  function onDeleteMovement(movementId) {
    dispatch("deletemovement", movementId);
  }

  function onCancel() {
    dispatch("cancel");
  }

  function onSave() {
    dispatch("save");
  }
</script>

<style>
  .input-ctn {
    margin-bottom: 2rem;
  }

  .input-ctn:not(:first-of-type) {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  :global(.input-ctn div) {
    width: 90%;
  }

  button {
    display: block;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    line-height: 1;
  }

  .delete-movement i {
    flex-basis: 10%;
    color: var(--color-error);
  }

  .add-movement {
    height: 4rem;
    margin: 0.5rem 0;
    padding: 0.5rem 0.5rem 0.5rem 0;
  }

  .add-movement span {
    display: flex;
    align-items: center;
    color: var(--color-primary);
  }

  .add-movement span i {
    color: var(--color-action);
  }
</style>

<EditFormModalLayout on:cancel={onCancel} on:submit={onSave}>
  <h2>{isEditing ? 'Edit' : 'Add'} Exercise</h2>
  {#if exerciseError}
    <p>{{ exerciseError }}</p>
  {/if}
  <!-- Movement input(s) -->
  {#each editedExercise.movements as movement, i (movement._id)}
    <div class="input-ctn">
      <Input
        label={`Movement ${i + 1}`}
        list="exercises"
        autofocus={true}
        on:input={e => onInput(e, movement._id)}
        value={movement ? movement.exercise.name : ''} />
      {#if i > 0}
        <!-- Delete movement btn -->
        <button
          class="delete-movement"
          on:click={onDeleteMovement(movement._id)}>
          <i class="material-icons">clear</i>
          <span class="screen-reader-text">Delete</span>
          <Ripple />
        </button>
      {/if}
    </div>
  {/each}
  <datalist id="exercises">
    {#each exercises as exercise (exercise._id)}
      <option value={exercise.name} data-exercise={JSON.stringify(exercise)} />
    {/each}
  </datalist>
  <!-- Add movement btn -->
  <button class="add-movement" on:click={onAddMovement}>
    <span>
      <i class="material-icons">add_circle</i>
      Add Movement
    </span>
    <Ripple />
  </button>
</EditFormModalLayout>
