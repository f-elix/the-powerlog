<script>
  // Svelte
  import { getContext } from "svelte";

  //   Components
  import MenuButton from "@/components/UI/MenuButton.svelte";
  import Drawer from "@/components/UI/Drawer.svelte";

  const { authState, authSend } = getContext("auth");

  let isOpen = "closed";

  function toggleMenu() {
    isOpen = isOpen === "closed" ? "open" : "closed";
  }
</script>

<style>
  header {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: var(--header-height);
    width: 100%;
    padding: 0 1rem;
    background-color: var(--color-fg-light);
    box-shadow: var(--shadow-default);
  }
</style>

<header>
  <!-- Logo + username's log -->
  <!-- <img src="" alt="" />  -->
  <MenuButton on:click={toggleMenu} state={isOpen} />
  <Drawer state={isOpen}>
    <!-- @TODO links -->
    <ul>
      <li />
    </ul>
  </Drawer>
</header>
