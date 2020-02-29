<script>
  // Components
  import Button from "@/components/UI/Button.svelte";

  export let sessionName;
  export let sessionId;
  export let date;
</script>

<style>
  .search-result {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 50rem;
    margin: 1rem auto;
    padding: 1rem;
    border-radius: var(--radius-default);
    background-color: var(--color-fg);
    box-shadow: var(--shadow-default);
  }

  .info h2,
  .info p {
    margin: 0;
  }
</style>

<article class="search-result">
  <div class="info">
    <h2>{sessionName}</h2>
    <p>{date}</p>
  </div>
  <Button variant="filled" color="info" id={sessionId}>View Session</Button>
</article>
