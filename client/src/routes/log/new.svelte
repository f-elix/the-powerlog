<script>
  // svelte
  import { setContext } from "svelte";

  // fsm
  import { editWorkoutMachine } from "@/fsm/workouts/editWorkoutMachine.js";
  import { useMachine } from "@/fsm/machineStores.js";

  // Components
  import EditWorkout from "@/components/workouts/EditWorkout.svelte";

  const { editWorkoutState, editWorkoutSend } = useMachine(editWorkoutMachine);

  setContext("editWorkout", {
    editWorkoutState,
    editWorkoutSend
  });
</script>

<EditWorkout workoutType="session" />
