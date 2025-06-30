<script lang="ts">
  import type { PageProps } from "./$types";
  import ChatView from "$lib/components/ChatView.svelte";
  import { setContext } from "svelte";

  let { data: loadResult }: PageProps = $props();

  setContext("settingsContext", loadResult.settings);
  setContext("runtimeContext", loadResult.runtimeContext);
</script>

<ChatView />
