<script>
  // Components
  import Input from "@/components/UI/Input.svelte";
  import Button from "@/components/UI/Button.svelte";
</script>

<style>
  .header {
    margin-bottom: 2rem;
    padding: 1rem;
  }

  .list {
    box-shadow: var(--default-box-shadow);
  }

  .list__header {
    background-color: var(--color-bg-light);
  }

  .list__header th {
    width: 22.5%;
    padding: 0.75rem;
  }

  .exercise {
    background-color: var(--color-fg);
  }

  .exercise:nth-of-type(even) {
    background-color: var(--color-fg-dark);
  }

  .movement__name td {
    padding: 0.5rem;
    font-weight: bold;
  }

  .set td {
    width: 22.5%;
    text-align: center;
  }

  .handle {
    width: 10%;
  }

  .exercise-btn-ctn {
    display: flex;
  }

  .exercise-btn-ctn button {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    line-height: 1;
  }

  .exercise-btn-ctn button.edit {
    color: var(--color-info);
  }

  .exercise-btn-ctn button.delete {
    color: var(--color-error);
  }

  .exercise-btn-ctn button span {
    display: none;
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

<form novalidate>
  <!-- Header -->
  <div class="header">
    <h1>Create a Template</h1>
    <Input label="Template Name" name="templateName" />
  </div>
  <!-- Exercises list -->
  <table class="list">
    <thead>
      <tr class="list__header">
        <th>Set(s)</th>
        <th>
          Rep(s)/
          <br />
          Time
        </th>
        <th>Load</th>
        <th>Rest</th>
        <th class="handle" />
      </tr>
    </thead>
    <tbody class="exercise">
      <td colspan="4">
        <table>
          <tr class="movement__name">
            <td colspan="3">Movement name</td>
            <td class="exercise-btn-ctn" colspan="2">
              <!-- Edit btn -->
              <button class="edit">
                <i class="material-icons">edit</i>
                <span>Edit</span>
                <!-- <Ripple /> -->
              </button>
              <!-- Delete btn -->
              <button class="delete">
                <i class="material-icons">delete</i>
                <span>Delete</span>
                <!-- <Ripple /> -->
              </button>
            </td>
          </tr>
          <tr class="set">
            <td>3</td>
            <td>10 sec</td>
            <td>315 lbs</td>
            <td>90 sec</td>
          </tr>
        </table>
      </td>
      <td class="handle">
        <i class="material-icons">reorder</i>
      </td>
    </tbody>
    <!-- <tbody class="exercise">
      <td colspan="5">
        <table>
          <tr class="movement__name">
            <td colspan="3">Movement name</td>
          </tr>
          <tr class="set">
            <td>3</td>
            <td>1 min</td>
            <td>80 %</td>
            <td>3 min 30 sec</td>
          </tr>
        </table>
      </td>
      <td class="handle">
        <i class="material-icons">reorder</i>
      </td>
    </tbody> -->

  </table>
  <div class="template-btn-ctn">
    <Button color="error" variant="filled">Cancel</Button>
    <Button color="action" variant="filled">Create</Button>
  </div>
</form>
