<script>
  // Svelte
  import { onMount, setContext } from "svelte";
  import { stores } from "@sapper/app";

  // FSM
  import { useMachine, useService } from "@/fsm/machineStores.js";
  import { workoutMachine } from "@/fsm/workouts/workoutMachine.js";

  // Components
  import DisplayWorkout from "@/components/workouts/DisplayWorkout.svelte";
  import EditWorkout from "@/components/workouts/EditWorkout.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";

  const { page } = stores();
  const { _id } = $page.params;

  const { workoutState, workoutSend } = useMachine(workoutMachine);

  $: console.log($workoutState);

  $: if ($workoutState.children.editWorkout) {
    const { editWorkoutState, editWorkoutSend } = useService(
      $workoutState.children.editWorkout
    );
    setContext("editWorkout", {
      editWorkoutState,
      editWorkoutSend
    });
  }

  onMount(() => {
    workoutSend({
      type: "LOAD_TEMPLATE",
      params: {
        templateId: _id
      }
    });
  });

  $: template = $workoutState.context.workoutData;

  function onDelete() {
    workoutSend({ type: "DELETE_TEMPLATE" });
  }

  function onEdit() {
    workoutSend({ type: "EDIT" });
  }

  function onDisplayOut() {
    workoutSend({ type: "DISPLAY_OUT" });
  }

  function onEditOut() {
    workoutSend({ type: "EDIT_OUT" });
  }
</script>

<style>
  .spinner-ctn {
    margin-top: 20rem;
  }
</style>

<!-- Loading spinner -->
{#if $workoutState.matches('fetching')}
  <div class="spinner-ctn">
    <Spinner />
  </div>
{/if}
<!-- Display template -->
{#if $workoutState.matches('displaying')}
  <DisplayWorkout
    workout={template}
    on:delete={onDelete}
    on:edit={onEdit}
    on:outroend={onDisplayOut} />
{/if}
<!-- Edit template -->
{#if $workoutState.matches('editing')}
  <EditWorkout workoutType="template" isNew={false} on:outroend={onEditOut} />
{/if}
