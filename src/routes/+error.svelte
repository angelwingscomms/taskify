<script lang="ts">
  import { page } from "$app/state";
</script>

<div class="error-page">
  <h1>Error: {page.error?.message}</h1>
  <p>{page.status}</p>

  <a href="/">Go to Home</a>
</div>

<style>
  .error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 20px;
    background-color: #f8f8f8;
    color: #333;
    font-family: Arial, sans-serif;
    line-height: 1.6;
  }

  .error-page h1 {
    font-size: 3em;
    color: #e74c3c; /* A strong red for errors */
    margin-bottom: 20px;
  }

  .error-page p {
    font-size: 1.2em;
    margin-bottom: 15px;
    max-width: 600px;
  }

  .error-page a {
    display: inline-block;
    margin-top: 30px;
    padding: 12px 25px;
    background-color: #3498db; /* A friendly blue */
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .error-page a:hover {
    background-color: #2980b9; /* Darker blue on hover */
  }

  /* Responsive adjustments */
  @media (max-width: 600px) {
    .error-page h1 {
      font-size: 2.5em;
    }

    .error-page p {
      font-size: 1em;
    }

    .error-page a {
      padding: 10px 20px;
    }
  }
</style>