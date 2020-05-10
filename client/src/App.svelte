<script>
  import { setContext } from "svelte";
  import { expoOut } from "svelte/easing";
  import { Router } from "@sveltech/routify";
  import { routes } from "@sveltech/routify/tmp/routes";

  setContext("page-transition", {
    duration: 800,
    x: 40,
    easing: expoOut
  });
</script>

<Router {routes} />
