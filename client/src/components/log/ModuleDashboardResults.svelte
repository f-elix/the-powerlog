<script>
  // Components
  import CardSearchResult from "@/components/log/CardSearchResult.svelte";
  import Spinner from "@/components/UI/Spinner.svelte";

  export let isLoading = false;
  export let isSuccess = false;
  export let isError = false;
  export let errorMessage = "No results found";
  export let sessions = [];
</script>

<style>
  .result-ctn {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    min-height: 12rem;
    overflow: hidden;
  }

  .error-message {
    color: var(--color-primary-50);
    text-align: center;
  }
</style>

<div class="result-ctn">
  <!-- Spinner -->
  {#if isLoading}
    <Spinner />
  {/if}
  {#if isSuccess}
    {#each sessions as session (session._id)}
      <CardSearchResult
        sessionName={session.title}
        date={session.sessionDate} />
    {/each}
  {/if}
  {#if isError}
    <h2 class="error-message">{errorMessage}</h2>
  {/if}
</div>
