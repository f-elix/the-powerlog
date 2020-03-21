<script>
  // Components
  import Input from "@/components/UI/Input.svelte";
  import Button from "@/components/UI/Button.svelte";
  import Ripple from "@/components/UI/Ripple.svelte";
  import TemplateExercise from "./TemplateExercise.svelte";
</script>

<style>
  .header {
    margin-bottom: 2rem;
  }

  .template-btn-ctn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 80%;
    margin: 0 auto;
    padding: 3rem 1rem;
  }
</style>

<!-- Header -->
<div class="header">
  <h1>Create a Template</h1>
  <Input label="Template Name" name="templateName" />
</div>
<!-- Exercises list -->
<ul class="exercise-list">
  <TemplateExercise />
  <TemplateExercise />
</ul>
<Button size="big" color="action">
  <i class="material-icons">add_box</i>
  Add Exercise
</Button>
<div class="template-btn-ctn">
  <Button color="error" variant="filled">Cancel</Button>
  <Button color="action" variant="filled">Create</Button>
</div>
