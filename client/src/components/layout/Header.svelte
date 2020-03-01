<script>
  // Svelte
  import { getContext } from "svelte";

  //   Components
  import MenuButton from "@/components/UI/MenuButton.svelte";
  import Drawer from "@/components/UI/Drawer.svelte";
  import Ripple from "@/components/UI/Ripple.svelte";

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
  }

  .logout {
    background-color: var(--color-primary-30);
  }
</style>

<header>
  <!-- Logo -->
  <img src="/img/icons/icon.svg" alt="" width="30" height="30" />
  <!-- Username -->
  <p class="username">{$authState.context.userData.name}'s log</p>
  <!-- Hamburger -->
  <MenuButton on:click={toggleMenu} state={isOpen} />
  <!-- Mobile nav -->
  <Drawer state={isOpen} on:click={toggleMenu}>
    <!-- @TODO links -->
    <ul class="nav">
      <!-- {#each links as link}
      {/each} -->
      <li on:click={() => authSend({ type: 'LOGOUT' })}>
        <a href="/" class="nav-link logout">logout</a>
        <Ripple />
      </li>
    </ul>
  </Drawer>
</header>
