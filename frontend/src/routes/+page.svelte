<script lang="ts">
  import type { PageProps } from "./$types";
  import ChatView from "$lib/components/ChatView.svelte";
  import { setContext } from "svelte";

  let { data: loadResult }: PageProps = $props();

  // Set to $state to allow for future functionality
  let settingsContext = $state(loadResult.settings);
  let runtimeContext = $state(loadResult.runtimeContext);
  let messageContext = $state([]);

  setContext("settingsContext", settingsContext);
  setContext("runtimeContext", runtimeContext);
  setContext("messageContext", messageContext);
</script>

<ChatView />
