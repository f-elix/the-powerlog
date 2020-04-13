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
  $: x = $editTemplateState.context.x;
  $: y = $editTemplateState.context.y;

  function onNameInput(e) {
    dispatch("nameinput", e.target.value);
  }

  function onAddExercise() {
    dispatch("addexercise");
  }

  function onPointerEnter(e, exercise) {
    const elHeight = e.currentTarget.offsetHeight;
    dispatch("pointerenter", {
      exerciseId: exercise._id,
      elHeight
    });
  }

  function move(node, animation, params) {
    const { exercise } = params;
    if (
      $editTemplateState.matches("dragging") &&
      draggedExercise._id === exercise._id
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
    width: 100%;
    max-width: calc(var(--main-width) - (var(--main-h-padding) * 2));
    background-color: var(--color-fg);
    transition: background-color 0.2s linear,
      transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  ul li:nth-of-type(even) {
    background-color: var(--color-fg-dark);
  }

  .dragged.dragged {
    position: relative;
    z-index: 1000;
    background-color: var(--color-fg-light);
    pointer-events: none;
    transition: none;
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
      style={$editTemplateState.matches('dragging') && draggedExercise._id === exercise._id ? `transform: translate3d(${x}px, ${y}px, 0px) scale(1.025);` : ''}
      class:dragged={$editTemplateState.matches('dragging') && draggedExercise._id === exercise._id}
      data-exercise-id={exercise._id}
      animate:move={{ exercise }}
      in:fly|local={{ x: 30 }}
      out:fly|local={{ x: 30, duration: 200 }}
      on:pointerenter={e => onPointerEnter(e, exercise)}
      on:pointerleave>
      <CardTemplateExercise
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
