<script lang="ts">
  import ListPage from "$lib/components/ListPage.svelte";
  import { katakanaCharacters } from "$lib/data/kana";
</script>

<ListPage
  title="Katakana - Kana"
  cards={katakanaCharacters}
  backUrl="/"
  backText="← Hjem"
  showTitle={true}
/>
