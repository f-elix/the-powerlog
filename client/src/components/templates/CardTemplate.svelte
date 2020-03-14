<script>
  // Svelte
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  // Components
  import Ripple from "@/components/UI/Ripple.svelte";

  export let template;
</script>

<style>

</style>

<article in:fly={{ x: 30 }} out:fly={{ x: 30, duration: 200 }}>
  <!-- <h3>{template.name}</h3> -->
  <div>
    <!-- Edit btn -->
    <button class="edit">
      <i class="material-icons">edit</i>
      <span>Edit</span>
      <Ripple />
    </button>
    <!-- Delete btn -->
    <button class="delete">
      <i class="material-icons">delete</i>
      <span>Delete</span>
      <Ripple />
    </button>
  </div>
</article>
