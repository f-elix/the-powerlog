<script>
  // Svelte
  import { params } from "@sveltech/routify";

  // FSM
  import { useMachine } from "@/fsm/machineStores.js";
  import { exerciseMachine } from "@/fsm/exercises/exerciseMachine.js";

  const { _id } = $params;

  const { exerciseState, exerciseSend } = useMachine(exerciseMachine(_id));

  $: console.log($exerciseState);
</script>

<style>

</style>

<h1>Exercise {_id} history</h1>
