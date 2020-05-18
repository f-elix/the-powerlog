<script>
  // Svelte
  import { params } from "@sveltech/routify";

  // FSM
  import { useMachine } from "@/fsm/machineStores.js";
  import { exerciseMachine } from "@/fsm/exercises/exerciseMachine.js";

  const { _id } = $params;

  const { exerciseState, exerciseSend } = useMachine(exerciseMachine(_id));

  $: pr = $exerciseState.context.prDisplay;
</script>

<style>

</style>

{#if $exerciseState.matches('idle')}
  <h1>{$exerciseState.context.exercise.name}</h1>
  <p>Personnal best: {pr}</p>
{/if}
