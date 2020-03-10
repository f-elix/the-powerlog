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
    z-index: 1000;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    height: var(--header-height);
    width: 100%;
    padding: 0 1rem;
    background-color: var(--color-fg-light);
    box-shadow: var(--shadow-default);
  }

  .username {
    margin: 0 auto 0 1rem;
  }

  ul {
    text-align: center;
  }

  .nav-link {
    display: block;
    width: 100%;
    padding: 1rem 0;
    text-decoration: none;
    color: var(--color-primary);
    font-size: var(--text-big);
    text-transform: uppercase;
    cursor: pointer;
  }

  .nav-link:active {
    background-color: var(--color-primary-10);
  }

  .logout {
    background-color: var(--color-primary-30);
  }
</style>

<header>
  <!-- Logo -->
  <a href="/dashboard">
    <img src="/img/icons/icon.svg" alt="" width="30" height="30" />
  </a>
  <!-- Username -->
  <p class="username">{$authState.context.userData.name}'s log</p>
  <!-- Hamburger -->
  <MenuButton on:click={toggleMenu} state={isOpen} />
  <!-- Mobile nav -->
  <Drawer state={isOpen} on:click={toggleMenu}>
    <ul class="nav">
      <li>
        <a href="/dashboard" class="nav-link">dashboard</a>
      </li>
      <li>
        <a href="/log" class="nav-link">full log</a>
      </li>
      <li>
        <a href="/exercises" class="nav-link">your exercises</a>
      </li>
      <li on:click={() => authSend({ type: 'LOGOUT' })}>
        <a href="/" class="nav-link logout">logout</a>
      </li>
    </ul>
  </Drawer>
</header>
