<script>
  // Components
  import CardWorkout from "@/components/workouts/CardWorkout.svelte";

  export let sessions;
</script>

<style>

</style>

{#each sessions as session, i (session._id)}
  <!-- Date title -->
  {#if !sessions[i - 1] || new Date(session.date).getMonth() !== new Date(sessions[i - 1].date).getMonth()}
    <h3>
      {new Date(session.date).toLocaleString('default', { month: 'long' })}
      {new Date(session.date).getFullYear()}
    </h3>
  {/if}
  <!-- Search results -->
  <CardWorkout workout={session} workoutType="session" />
{/each}
