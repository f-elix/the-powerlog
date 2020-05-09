<script>
  // Svelte
  import { onMount, setContext } from "svelte";
  import { goto } from "@sveltech/routify";

  // FSM
  import { editWorkoutMachine } from "@/fsm/workouts/editWorkoutMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import EditWorkout from "@/components/workouts/EditWorkout.svelte";

  const { editWorkoutState, editWorkoutSend } = useMachine(
    editWorkoutMachine.withConfig({
      actions: {
        routeLog: () => $goto("/log"),
        routeTemplates: () => $goto("/templates")
      }
    })
  );

  onMount(() => {
    editWorkoutSend({ type: "NEW_WORKOUT" });
  });

  setContext("editWorkout", {
    editWorkoutState,
    editWorkoutSend
  });
</script>

<EditWorkout workoutType="template" />
