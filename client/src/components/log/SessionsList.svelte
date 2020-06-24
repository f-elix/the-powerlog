<script>
  // Svelte
  import { flip } from "svelte/animate";
  import { fly, fade } from "svelte/transition";

  // Components
  import CardWorkout from "@/components/workouts/CardWorkout.svelte";

  export let sessions;

  function getLocalDate(dateInput) {
    const date = new Date(dateInput);
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * -60000
    );
    return localDate;
  }
</script>

<style>
  ul {
    margin: 2rem auto;
    list-style-type: none;
    overflow: hidden;
  }
</style>

<ul>
  {#each sessions as session, i (session._id)}
    <li
      animate:flip={{ duration: 200 }}
      out:fly|local={{ duration: 200, x: 30 }}
      in:fade={{ duration: 200 }}>
      {#if !sessions[i - 1] || getLocalDate(session.date).getMonth() !== getLocalDate(sessions[i - 1].date).getMonth()}
        <!-- Date title -->
        <h3>
          {getLocalDate(session.date).toLocaleString('default', {
            month: 'long'
          })}
          {getLocalDate(session.date).getFullYear()}
        </h3>
      {/if}
      <!-- Search results -->
      <CardWorkout
        workout={session}
        workoutDate={getLocalDate(session.date)}
        workoutType="session"
        on:delete />
    </li>
  {/each}
</ul>
