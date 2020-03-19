<script>
  // Svelte
  import { getContext } from "svelte";

  // Components
  import MenuButton from "@/components/UI/MenuButton.svelte";
  import Drawer from "@/components/UI/Drawer.svelte";

  const { authState, authSend } = getContext("auth");

  let isSubMenuOpen = false;

  function toggleMenu() {
    isSubMenuOpen = !isSubMenuOpen;
  }
</script>

<style>
  header {
    --header-color: var(--color-fg-light);
    position: fixed;
    z-index: 1000;
    bottom: 0;
    left: 0;
    right: 0;
    height: 6rem;
    width: 100%;
    display: flex;
    background-color: var(--header-color);
    box-shadow: var(--shadow-default);
  }

  header a {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--color-primary);
    font-size: var(--text-small);
    text-transform: capitalize;
    cursor: pointer;
  }

  nav {
    width: 85%;
    height: 100%;
    padding: 0.5rem;
  }

  ul {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    margin: 0;
  }

  .nav-link {
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
  }

  .add {
    box-sizing: content-box;
    width: 15%;
    padding: 1rem;
    border-radius: 50%;
    border: none;
    outline: none;
    background-color: var(--header-color);
    color: var(--color-primary);
    transform: translate(5%, -30%);
  }

  .add-icon-ctn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .add-icon {
    padding: 1rem;
    border-radius: 50%;
    background-color: var(--color-fg);
    font-size: 4rem;
    transition: transform 0.2s cubic-bezier(0.5, 0, 0.5, 1);
  }

  .add-icon.rotate {
    transform: rotate(45deg);
  }

  .submenu {
    position: absolute;
    top: 0;
    right: 1.5rem;
    z-index: -100;
    display: flex;
    flex-direction: column;
    width: fit-content;
    opacity: 0;
    transition: transform 0.2s cubic-bezier(0.5, 0, 0.5, 1),
      opacity 0.15s linear;
  }

  .submenu i {
    font-size: 2rem;
  }

  .submenu-link {
    transform: translateY(100%);
    transition: transform 0.2s cubic-bezier(0.5, 0, 0.5, 1) 0.1s;
  }

  .submenu.open {
    transform: translateY(-175%);
    opacity: 1;
  }

  .submenu-link.open {
    transform: translateY(0);
  }

  .overlay {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: -1000;
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transform: scale(0);
    transition: transform 0.2s cubic-bezier(0.5, 0, 0.5, 1),
      opacity 0.15s linear;
  }

  .overlay.open {
    opacity: 1;
    transform: scale(6);
  }
</style>

<header>
  <!-- Logo -->
  <!-- Username -->
  <!-- <p class="username">{$authState.context.userData.name}'s log</p> -->
  <!-- Hamburger -->
  <!-- <MenuButton on:click={toggleMenu} state={isOpen} /> -->
  <!-- Mobile nav -->
  <nav>
    <ul>
      <li on:click={() => authSend({ type: 'LOGOUT' })}>
        <a href="/" class="nav-link">
          <i class="material-icons">power_settings_new</i>
          logout
        </a>
      </li>
      <li>
        <a href="/dashboard" class="nav-link">
          <!-- <img src="/img/icons/icon.svg" alt="" width="25" height="25" /> -->
          <i class="material-icons">dashboard</i>
          dashboard
        </a>
      </li>
      <li>
        <a href="/log" class="nav-link">
          <i class="material-icons">view_list</i>
          log
        </a>
      </li>
      <li>
        <a href="/exercises" class="nav-link">
          <i class="material-icons">fitness_center</i>
          exercises
        </a>
      </li>
      <li>
        <a href="/templates" class="nav-link">
          <i class="material-icons">insert_drive_file</i>
          templates
        </a>
      </li>
    </ul>
  </nav>
  <button class="add" on:click={toggleMenu}>
    <div class="add-icon-ctn">
      <i class="material-icons add-icon" class:rotate={isSubMenuOpen}>add</i>
    </div>
  </button>
  <div class="submenu" class:open={isSubMenuOpen}>
    <a href="/templates">
      <i class="material-icons">add</i>
      New Template
    </a>
    <a href="/sessions" class="submenu-link" class:open={isSubMenuOpen}>
      <i class="material-icons">add</i>
      New Session
    </a>
  </div>
  <div class="overlay" class:open={isSubMenuOpen} />
</header>
