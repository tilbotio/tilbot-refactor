<script lang="ts">
  import type { PageProps } from "./$types";

  let { data: loadResult }: PageProps = $props();
</script>

<div class="w-full h-full bg-gray-50">
  <h1>Showheader property is {loadResult.showHeader}</h1>
  <p>Data received from +page.ts: {JSON.stringify(loadResult, null, 2)}</p>
</div>
