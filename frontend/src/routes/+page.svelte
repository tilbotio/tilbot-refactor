<script lang="ts">
  import type { PageProps } from "./$types";
  import ChatView from "$lib/components/ChatView.svelte";

  let { data: loadResult }: PageProps = $props();
</script>

<ChatView {...loadResult} />
