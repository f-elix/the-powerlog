<script>
  // Svelte
  import { fly } from "svelte/transition";

  // Components
  import CardWorkout from "@/components/workouts/CardWorkout.svelte";

  export let sessions;
</script>

<style>
  ul {
    margin: 2rem auto;
    list-style-type: none;
    overflow: hidden;
  }
</style>

<ul in:fly|local={{ x: 30 }} out:fly|local={{ x: 30, duration: 200 }}>
  {#each sessions as session, i (session._id)}
    <!-- Date title -->
    {#if !sessions[i - 1] || new Date(session.date).getMonth() !== new Date(sessions[i - 1].date).getMonth()}
      <h3>
        {new Date(session.date).toLocaleString('default', { month: 'long' })}
        {new Date(session.date).getFullYear()}
      </h3>
    {/if}
    <li>
      <!-- Search results -->
      <CardWorkout workout={session} workoutType="session" on:delete />
    </li>
  {/each}
</ul>
