<script>
  // Svelte
  import { getContext } from "svelte";
  import { stores } from "@sapper/app";

  // Components
  import MenuButton from "@/components/UI/MenuButton.svelte";
  import Drawer from "@/components/UI/Drawer.svelte";

  const { authState, authSend } = getContext("auth");

  const { page } = stores();

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
  }

  nav ul {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    margin: 0;
  }

  nav ul li {
    height: 100%;
    width: 20%;
  }

  .nav-link {
    height: 100%;
    flex-direction: column;
    justify-content: space-around;
    padding: 0 0.5rem;
  }

  .current-link {
    background-color: var(--color-primary);
    color: var(--header-color);
  }

  .add {
    position: relative;
    box-sizing: content-box;
    width: 15%;
    padding: 0 1rem;
    border: none;
    outline: none;
    background-color: var(--header-color);
    color: var(--color-primary);
  }

  .add::before {
    content: "";
    position: absolute;
    z-index: -10;
    top: -2rem;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: inherit;
  }

  .add-icon-ctn {
    position: relative;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    transform: translateY(-1rem);
  }

  .add-icon {
    padding: 1rem;
    border-radius: 50%;
    background-color: var(--color-bg);
    border: 2px solid var(--color-action);
    font-size: 4rem;
    transition: transform 0.2s cubic-bezier(0.5, 0, 0.5, 1),
      border-color 0.2s linear;
  }

  .add-icon.open {
    border-color: var(--color-info);
    transform: rotate(45deg);
  }

  .submenu {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    width: 40rem;
    height: 40rem;
    display: flex;
    flex-direction: column;
    padding: 6rem 7rem;
    border-radius: 50%;
    background-color: rgba(36, 52, 71, 0.85);
    transform: translate(-40%, -40%) scale(0);
    transition: transform 0.2s cubic-bezier(0.5, 0, 0.5, 1),
      opacity 0.15s linear;
  }

  .submenu.open {
    transform: translate(-40%, -40%) scale(1);
  }

  .submenu i {
    font-size: 2rem;
    color: var(--color-action);
  }

  .submenu a {
    padding: 1rem 0;
    font-size: var(--text-big);
    transform: translateY(100%);
  }

  .submenu a:first-of-type {
    transition: transform 0.2s cubic-bezier(0.5, 0, 0.5, 1) 0.05s;
  }

  .submenu a:nth-of-type(2) {
    margin-left: -2rem;
    transition: transform 0.2s cubic-bezier(0.5, 0, 0.5, 1) 0.1s;
  }

  .submenu.open a {
    transform: translateY(0);
  }
</style>

<header>
  <nav>
    <ul>
      <li on:click={() => authSend({ type: 'LOGOUT' })}>
        <a href="/" class="nav-link">
          <i class="material-icons">power_settings_new</i>
          logout
        </a>
      </li>
      <li>
        <a
          href="/dashboard"
          class="nav-link"
          class:current-link={$page.path.includes('/dashboard')}>
          <i class="material-icons">dashboard</i>
          dashboard
        </a>
      </li>
      <li>
        <a
          href="/log"
          class="nav-link"
          class:current-link={$page.path.includes('/log')}>
          <i class="material-icons">view_list</i>
          log
        </a>
      </li>
      <li>
        <a
          href="/exercises"
          class="nav-link"
          class:current-link={$page.path.includes('/exercises')}>
          <i class="material-icons">fitness_center</i>
          exercises
        </a>
      </li>
      <li>
        <a
          href="/templates"
          class="nav-link"
          class:current-link={$page.path.includes('/templates')}>
          <i class="material-icons">insert_drive_file</i>
          templates
        </a>
      </li>
    </ul>
  </nav>
  <button class="add" on:click={toggleMenu}>
    <div class="add-icon-ctn">
      <i class="material-icons add-icon" class:open={isSubMenuOpen}>add</i>
    </div>
    <div class="submenu" class:open={isSubMenuOpen}>
      <a href="/sessions">
        <i class="material-icons">add</i>
        Session
      </a>
      <a href="/templates">
        <i class="material-icons">add</i>
        Template
      </a>
    </div>
  </button>
</header>
