<script lang="ts">
  import { goto } from "$app/navigation";
  import { handleLinkClick } from "$lib/utils/interaction";
  import Link from "./Link.svelte";

  export let text: string = "← Tilbake";
  export let url: string = "/";
</script>

<Link {url} onPointerDown={event => handleLinkClick(event, url, goto)}>
  {text}
</Link>
