<script>
  import Button from "@/components/UI/Button.svelte";
</script>

<style>
  :global(.class) {
    margin: 1rem;
  }
</style>

<div>
  <Button color="action" size="big" extClass="class">long text</Button>
  <Button color="info" variant="filled" size="big">Button</Button>
  <Button color="action" size="fab">
    <i class="material-icons">add</i>
  </Button>
</div>
