<script>
  // Svelte
  import { fade } from "svelte/transition";

  // Components
  import CardSearchResult from "@/components/log/CardSearchResult.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";

  export let sessions = [];
  export let isLoading;
  export let isSuccess;
  export let isError;
  export let errorMessage;
</script>

<style>
  .result-ctn {
    min-height: 12rem;
    overflow: hidden;
  }

  .error-message {
    color: var(--color-primary-50);
    text-align: center;
  }
</style>

<div class="result-ctn">
  {#if isLoading}
    <Spinner />
  {/if}
  {#if isSuccess}
    <ul class="results-list">
      {#each sessions as session (session._id)}
        <li in:fade={{ duration: 200 }}>
          <CardSearchResult {session} />
        </li>
      {/each}
    </ul>
  {/if}
  {#if isError}
    <h2 class="error-message">{errorMessage}</h2>
  {/if}
</div>
