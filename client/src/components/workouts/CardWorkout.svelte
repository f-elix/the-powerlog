<script>
  // Svelte
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  // Components
  import Ripple from "@/components/UI/Ripple.svelte";

  const dispatch = createEventDispatcher();

  export let workoutType = "session";
  export let workout;

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  const dayName = days[new Date(workout.date).getDay()];

  function onView() {
    dispatch("view", workout._id);
  }

  function onDelete() {
    dispatch("delete", workout._id);
  }
</script>

<style>
  article {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 50rem;
    margin: 1rem auto;
    padding: 1rem;
    border-radius: var(--radius-default);
    background-color: var(--color-fg-light);
    box-shadow: var(--shadow-default);
  }

  .workout-info {
    display: flex;
    justify-content: center;
    align-items: start;
    flex-direction: column;
  }

  .workout-info h3,
  .workout-info p {
    margin: 0;
  }

  button {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    line-height: 1;
  }

  button span {
    display: none;
  }

  button.view {
    color: var(--color-info);
  }

  button.delete {
    color: var(--color-error);
  }
</style>

<article>
  <div class="workout-info">
    <h3>{workout.name}</h3>
    {#if workoutType === 'session'}
      <p>{workout.date} | {dayName}</p>
    {/if}
  </div>
  <div>
    <!-- View workout btn -->
    <a
      href={`${workoutType === 'session' ? 'log' : 'templates'}/${workout._id}`}>
      <button class="view">
        <i class="material-icons">visibility</i>
        <span>View {workoutType === 'session' ? 'session' : 'template'}</span>
        <Ripple />
      </button>
    </a>
    <!-- Delete btn -->
    <button class="delete" on:click={onDelete}>
      <i class="material-icons">delete</i>
      <span>Delete</span>
      <Ripple />
    </button>
  </div>
</article>
