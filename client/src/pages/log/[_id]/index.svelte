<script>
  // Svelte
  import { onMount, setContext, getContext } from "svelte";
  import { fly } from "svelte/transition";
  import { params, goto } from "@sveltech/routify";

  // FSM
  import { useMachine, useService } from "@/fsm/machineStores.js";
  import { workoutMachine } from "@/fsm/workouts/workoutMachine.js";

  // Components
  import DisplayWorkout from "@/components/workouts/DisplayWorkout.svelte";
  import EditWorkout from "@/components/workouts/EditWorkout.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";

  const pageTransition = getContext("page-transition");

  const { _id } = $params;

  const { workoutState, workoutSend } = useMachine(
    workoutMachine.withConfig({
      actions: {
        routeLog: () => $goto("/log"),
        routeTemplates: () => $goto("/templates")
      }
    })
  );

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
      type: "LOAD_SESSION",
      params: {
        sessionId: _id
      }
    });
  });

  $: session = $workoutState.context.workoutData;

  function onDelete() {
    workoutSend({ type: "DELETE_SESSION" });
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

<div in:fly={pageTransition}>
  <!-- Loading spinner -->
  {#if $workoutState.matches('fetching')}
    <div class="spinner-ctn">
      <Spinner />
    </div>
  {/if}
  <!-- Display session -->
  {#if $workoutState.matches('displaying')}
    <DisplayWorkout
      workout={session}
      on:delete={onDelete}
      on:edit={onEdit}
      on:outroend={onDisplayOut} />
  {/if}
  <!-- Edit session -->
  {#if $workoutState.matches('editing')}
    <EditWorkout isNew={false} on:outroend={onEditOut} />
  {/if}
</div>
