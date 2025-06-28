<script lang="ts">
  import type { RuntimeContext } from "$lib/types/RuntimeContext";

    let { path, participantId }: RuntimeContext = $props();
</script>

<h1>Awesome, we know only get path (which is {path}) and participantId (which is null, but who cares)</h1>