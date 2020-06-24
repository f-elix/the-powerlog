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

  function isFirstOfWeek(sessionDateStr, i) {
    if (!sessions[i + 1]) {
      return false;
    }
    if (sessionDateStr === sessions[i + 1].date) {
      return false;
    }
    const sessionDate = getLocalDate(sessionDateStr);
    const precedingSessionDate = getLocalDate(sessions[i + 1].date);
    if (sessionDate.getMonth() !== precedingSessionDate.getMonth()) {
      return true;
    }
    if (Math.abs(sessionDate.getDate() - precedingSessionDate.getDate()) > 6) {
      return true;
    }
    const sessionDay = sessionDate.getDay();
    const precedingSessionDay = precedingSessionDate.getDay();
    if (precedingSessionDay === 0 || sessionDay === 1) {
      return true;
    }
    if (sessionDay !== 0 && sessionDay < precedingSessionDay) {
      return true;
    }
    return false;
  }
</script>

<style>
  ul {
    margin: 2rem auto;
    list-style-type: none;
    overflow: hidden;
  }

  .week-separator {
    width: 50%;
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
      <!-- Week separator -->
      {#if isFirstOfWeek(session.date, i)}
        <hr class="week-separator" />
      {/if}
    </li>
  {/each}
</ul>
