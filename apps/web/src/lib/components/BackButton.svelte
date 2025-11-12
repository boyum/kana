<svelte:options runes={true} />

<script lang="ts">
  import { goto } from "$app/navigation";
  import { handleLinkClick } from "$lib/utils/interaction";
  import Link from "./Link.svelte";

  interface Props {
    text?: string;
    url?: string;
  }

  let { text = "← Tilbake", url = "/" }: Props = $props();
</script>

<Link {url} onPointerDown={event => handleLinkClick(event, url, goto)}>
  {text}
</Link>
