<script>
  const fromToForm = "fromTo";
  const byDateForm = "byDate";
  const byNameForm = "byName";

  let currentForm = byNameForm;
</script>

<style>
  .form {
    margin: 1.5rem auto;
    padding-bottom: 1.5rem;
    border-radius: var(--default-radius);
    background-color: var(--color-fg-light);
    box-shadow: var(--default-box-shadow);
    overflow: hidden;
  }

  .form__header {
    margin: 0 0 1.5rem 0;
    padding: 1.5rem 0;
    display: flex;
    justify-content: center;
    border-top-right-radius: var(--default-radius);
    border-top-left-radius: var(--default-radius);
    text-align: center;
    background-color: var(--color-fg-dark);
    color: var(--color-primary);
  }

  .form__header--title {
    margin-right: 0.75rem;
    color: var(--color-primary);
  }

  .form__header--select {
    align-self: center;
    padding: 0.25rem 0.75rem;
    border: 3px solid var(--color-primary);
    border-radius: var(--default-radius);
    font-size: 1.25rem;
    background-color: inherit;
    color: inherit;
    outline: none;
    cursor: pointer;
  }
</style>

<form class="form">
  <div class="form__header">
    <h2 class="form__header--title">Search log by</h2>
    <select
      name="searchType"
      id="searchType"
      class="form__header--select"
      v-model="searchType">
      <option value="date" selected>Date</option>
      <option value="time period">Time Period</option>
      <option value="session name">Session Name</option>
    </select>
  </div>
  <div class="form__inputs" />
</form>
