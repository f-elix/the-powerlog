<script>
  // Svelte
  import { onMount } from "svelte";

  // Components
  import Button from "../UI/Button.svelte";

  let deferredPrompt = null;
  let installBtn;

  onMount(() => {
    installBtn = document.querySelector("#installBtn");
    installBtn.style.display = "none";

    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.style.removeProperty("display");
      return false;
    });
  });

  function promptInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === "accepted") {
          console.log("The Strength Log has been successfully installed.");
        } else {
          console.log("User dismissed installation.");
        }
      });
      deferredPrompt = null;
    }
  }
</script>

<style>
  .title {
    height: 47.5%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 1rem;
  }

  h2 {
    margin-bottom: 3rem;
  }
</style>

<div class="title">
  <!-- Logo -->
  <img src="/icons/icon.svg" alt="" width="144" height="144" />

  <!-- Title -->
  <h1>The Power Log</h1>
  <h2>
    Log your training,
    <br />
    Get the Results.
  </h2>

  <!-- Install btn -->
  <Button
    variant="filled"
    color="primary-30"
    on:click={promptInstall}
    id="installBtn">
    <i class="material-icons">get_app</i>
    Install
  </Button>
</div>
