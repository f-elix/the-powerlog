<script>
  import { setContext } from "svelte";
  import { expoOut } from "svelte/easing";
  import { Router } from "@sveltech/routify";
  import { routes } from "@sveltech/routify/tmp/routes";
  import { register } from "register-service-worker";

  if (process.env.NODE_ENV === "production") {
    register(`${process.env.BASE_URL}service-worker.js`, {
      ready(registration) {
        console.log("Service worker is active.");
      },
      registered(registration) {
        console.log("Service worker has been registered.");
      },
      cached(registration) {
        console.log("Content has been cached for offline use.");
      },
      updatefound(registration) {
        console.log("New content is downloading.");
      },
      updated(registration) {
        console.log("New content is available; please refresh.");
        const updateBanner = document.getElementById("update-banner");
        const updateButton = document.getElementById("update-button");
        const dismissButton = document.getElementById("dismiss-button");

        updateBanner.style.display = "block";
        updateButton.addEventListener("click", () => {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
          window.location.reload();
        });
        dismissButton.addEventListener("click", () => {
          updateBanner.style.display = "none";
        });
      },
      offline() {
        console.log(
          "No internet connection found. App is running in offline mode."
        );
      },
      error(error) {
        console.error("Error during service worker registration:", error);
      }
    });
  }

  setContext("page-transition", {
    duration: 800,
    x: 40,
    easing: expoOut
  });
</script>

<Router {routes} />
