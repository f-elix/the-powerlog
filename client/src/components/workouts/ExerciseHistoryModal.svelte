<script>
  // Svelte
  import { getContext } from "svelte";

  // Components
  import EditFormModalLayout from "./EditFormModalLayout.svelte";
  import Spinner from "../UI/Spinner.svelte";

  const { editWorkoutState, editWorkoutSend } = getContext("editWorkout");

  $: exercise = $editWorkoutState.context.exerciseHistory;

  $: console.log(exercise);

  function onCancel() {
    editWorkoutSend({ type: "DISMISS" });
  }
</script>

<style>
  .set-ctn {
    display: flex;
    align-items: center;
    margin-top: 1rem;
    cursor: pointer;
  }

  .set {
    display: flex;
    justify-content: space-between;
    width: 14rem;
    margin-right: 1rem;
  }
</style>

<EditFormModalLayout on:cancel={onCancel} on:submit={onCancel}>
  {#if $editWorkoutState.matches('exerciseHistory.displaying')}
    <h2>Last {exercise.name} performance</h2>
    <p>{exercise.date}</p>
    {#each exercise.executions as execution, i}
      <div class="set-ctn">
        <p class="set">
          <span>{execution.sets}</span>
          <span>x</span>
          {#if execution.reps !== undefined && execution.reps !== null}
            <span>{execution.reps}</span>
          {:else}
            <span>{execution.time.amount}</span>
            <span>{execution.time.unit.toLowerCase()}</span>
          {/if}
          <span>|</span>
          <span>
            {execution.load.amount} {execution.load.unit.toLowerCase()}
          </span>
        </p>
      </div>
    {/each}
  {/if}
  {#if $editWorkoutState.matches('exerciseHistory.empty')}
    <p>No performance recorded yet</p>
  {/if}
  {#if $editWorkoutState.matches('exerciseHistory.fetching')}
    <Spinner />
  {/if}
</EditFormModalLayout>
