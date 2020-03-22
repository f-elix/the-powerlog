<script>
  // Components
  import Ripple from "@/components/UI/Ripple.svelte";
  import Button from "@/components/UI/Button.svelte";
</script>

<style>
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background-color: var(--color-fg);
  }

  li:nth-of-type(even) {
    background-color: var(--color-fg-dark);
  }

  .content-ctn {
    width: 65%;
  }

  .content-ctn p {
    margin: 0;
  }

  .content-ctn .movement-name {
    font-weight: bold;
    font-size: var(--text-big);
  }

  .content-ctn .set {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }

  .content-ctn .set p {
    width: 40%;
  }

  .add-set-btn {
    margin: 0.5rem 0;
    padding: 0.5rem;
    color: var(--color-action);
  }

  button {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    line-height: 1;
  }

  .actions-ctn {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .actions-ctn button.edit {
    color: var(--color-info);
  }

  .actions-ctn button.delete {
    color: var(--color-error);
  }

  .actions-ctn button.handle {
    color: var(--color-primary);
  }
</style>

<li>
  <!-- Content -->
  <div class="content-ctn">
    <p class="movement-name">Movement name</p>
    <div class="set">
      <p>
        <span>3</span>
        <span>X</span>
        <span>10</span>
      </p>
      <p>
        <span>225</span>
        <span>lbs</span>
      </p>
    </div>
    <button class="add-set-btn">
      <i class="material-icons">add_circle_outline</i>
      <Ripple />
    </button>
  </div>
  <!-- actions -->
  <div class="actions-ctn">
    <!-- Edit btn -->
    <button class="edit">
      <i class="material-icons">edit</i>
      <span class="screen-reader-text">Edit</span>
      <Ripple />
    </button>
    <!-- Delete btn -->
    <button class="delete">
      <i class="material-icons">delete</i>
      <span class="screen-reader-text">Delete</span>
      <Ripple />
    </button>
    <!-- Handle btn -->
    <button class="handle">
      <i class="material-icons">reorder</i>
      <span class="screen-reader-text">Re-order</span>
    </button>
  </div>
</li>
