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
  }
</style>

<header>
  <MenuButton on:click={toggleMenu} state={isOpen} />
  <Drawer state={isOpen} />
</header>
