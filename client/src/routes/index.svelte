<script>
  import Button from "@/components/UI/Button.svelte";
  import Input from "@/components/UI/Input.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";
  import AppLoader from '@/components/UI/AppLoader.svelte'

</script>

<style>

</style>

<!-- <AppLoader /> -->

<div>
  <Button color="action" extClass="class">long text</Button>
  <Button color="info" variant="filled" size="big">Button</Button>
  <Button color="action" size="fab" position="bottom-right" variant="filled">
    <i class="material-icons">add</i>
  </Button>
  <Input placeholder="test" errorMessage="This is an error message, please fix." />
  <Input label="E-mail" name="email" type="email" />
  <Input label="Qty" name="qty" type="number" value="42" />
  <Input label="Date" name="date" type="date" />
  <Input label="Textarea" name="text" type="textarea" />
  <Spinner />
</div>
