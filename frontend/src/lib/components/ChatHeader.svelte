<script lang="ts">
  import { firstLetter } from "$lib/utils/functions";
  let { name } = $props();
</script>

<h1>This is our ChatHeader component. Hello {firstLetter(name)}</h1>
