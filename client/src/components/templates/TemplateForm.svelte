<script>
  // svelte
  import { createEventDispatcher, getContext } from "svelte";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";

  // Components
  import Input from "@/components/UI/Input.svelte";
  import Button from "@/components/UI/Button.svelte";
  import CardTemplateExercise from "./CardTemplateExercise.svelte";

  const dispatch = createEventDispatcher();

  const { editTemplateState } = getContext("editTemplate");

  export let templateName;
  export let templateExercises;

  $: draggedExercise = $editTemplateState.context.draggedExercise;
  $: hoveredExercise = $editTemplateState.context.hoveredExercise;
  $: x = $editTemplateState.context.x;
  $: y = $editTemplateState.context.y;

  function onNameInput(e) {
    dispatch("nameinput", e.target.value);
  }

  function onAddExercise() {
    dispatch("addexercise");
  }

  function onMouseEnter(e, exercise) {
    dispatch("hover", exercise);
  }

  function onMouseLeave(e, exercise) {
    dispatch("leave");
  }

  function move(node, animation, params) {
    const { exercise } = params;
    if (
      $editTemplateState.matches("dragging") &&
      exercise._id === draggedExercise._id
    ) {
      return {
        easing: _ => 0
      };
    }

    return flip(node, animation, { duration: 200 });
  }
</script>

<style>
  ul li {
    background-color: var(--color-fg);
    transition: transform 0.25s cubic-bezier(0.7, 0, 0.3, 1);
  }

  ul li:nth-of-type(even) {
    background-color: var(--color-fg-dark);
  }
</style>

<!-- Name input -->
<Input
  label="Template Name"
  name="templateName"
  errorMessage={$editTemplateState.context.nameError}
  on:input={onNameInput}
  value={templateName} />
<!-- Exercises list -->
<ul class="exercise-list">
  {#each templateExercises as exercise (exercise._id)}
    <li
      style={$editTemplateState.matches('dragging') && draggedExercise._id === exercise._id ? `transform: translate(${x}px, ${y}px); z-index: 100; transition: none` : ''}
      animate:move={{ exercise }}
      in:fly|local={{ x: 30 }}
      out:fly|local={{ x: 30, duration: 200 }}
      on:mouseenter={e => onMouseEnter(e, exercise)}
      on:mouseleave={e => onMouseLeave(e, exercise)}>
      <CardTemplateExercise
        isDragging={$editTemplateState.matches('dragging') && draggedExercise._id}
        {exercise}
        on:editexercise
        on:deleteexercise
        on:addexecution
        on:editexecution
        on:deleteexecution
        on:drag />
    </li>
  {/each}
</ul>
<!-- Add exercise button -->
<Button size="big" color="action" on:click={onAddExercise}>
  <i class="material-icons">add_box</i>
  Add Exercise
</Button>
