<script>
  // Components
  import CardExercise from "@/components/exercises/CardExercise.svelte";
  import Button from "@/components/UI/Button.svelte";
  import Input from "@/components/UI/Input.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";

  const testExercise = "Squat";
</script>

<style>
  h1 {
    text-transform: capitalize;
  }

  ul {
    margin: 2rem auto;
    list-style-type: none;
  }

  form {
    position: relative;
    margin: 2rem auto;
  }

  form .search-icon {
    position: absolute;
    top: 20%;
    right: 5%;
    z-index: 10;
  }
</style>

<section>
  <form novalidate>
    <i class="material-icons search-icon">search</i>
    <Input type="search" label="Search Exercises" name="exercises" />
  </form>
  <h1>your exercises</h1>
  <Button size="big" variant="filled" color="action">
    <i class="material-icons">add</i>
    Add new exercise
  </Button>
  <ul>
    <li>
      <CardExercise exerciseName={testExercise} />
    </li>
  </ul>

</section>
