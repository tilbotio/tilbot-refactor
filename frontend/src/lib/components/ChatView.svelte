<script lang="ts">
  import ChatHeader from "./ChatHeader.svelte";
  import type { ChatSettings } from "../../../../common/ChatSettings";
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import { getContext } from "svelte";

  const runtimeContext: RuntimeContext = getContext("runtime-context");
  const settingsContext: ChatSettings = getContext("settings-context");
</script>

<div class="flex flex-col w-full h-full">
  {#if runtimeContext.showHeader}
    <ChatHeader />
  {/if}
</div>
