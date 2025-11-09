<script lang="ts">
  import ListPage from "$lib/components/ListPage.svelte";
  import { hiraganaCharacters } from "$lib/data/kana";
</script>

<ListPage
  title="Hiragana - Kana"
  cards={hiraganaCharacters}
  backUrl="/"
  backText="← Hjem"
/>
