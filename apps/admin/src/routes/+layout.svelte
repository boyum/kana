<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<svelte:head>
  <title>Kana Admin</title>
</svelte:head>

{@render children()}
