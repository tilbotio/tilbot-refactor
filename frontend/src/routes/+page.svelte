<script lang="ts">
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<div class="w-full h-full bg-gray-50">
  <h1>Showheader property is {data.showHeader}</h1>
  <p>Data received from +page.ts: {data}</p>
</div>
