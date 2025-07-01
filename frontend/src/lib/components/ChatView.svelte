<script lang="ts">
  import ChatHeader from "./ChatHeader.svelte";
  import type { ChatSettings } from "../../../../common/ChatSettings";
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import { getContext } from "svelte";

  const runtimeContext: RuntimeContext = getContext("runtimeContext");
</script>

<div class="flex flex-col w-full h-full">
  {#if runtimeContext.showHeader}
    <ChatHeader />
  {/if}
</div>
