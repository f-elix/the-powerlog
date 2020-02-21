<script>
  import Button, { Label } from "@smui/button";
  import FloatingLabel from "@smui/floating-label";
  import TextField, { Input, Textarea } from "@smui/textfield";
  import Switch from "@smui/switch";
  import FormField from "@smui/form-field";
</script>

<style>

</style>

<div>

  <Button color="primary">
    <Label>Button Label</Label>
  </Button>
  <Button variant="raised">Button</Button>
  <Button variant="unelevated">Button</Button>
  <Button variant="outlined">Button</Button>
  <Button dense>Button</Button>
  <TextField input$autocomplete="email">
    <FloatingLabel>Label</FloatingLabel>
    <Input type="email" />
  </TextField>
  <TextField variant="filled">
    <Input label="input" />
    <FloatingLabel>Label</FloatingLabel>
  </TextField>
  <FormField>
    <Label>Form field</Label>
    <Switch />
  </FormField>
</div>
