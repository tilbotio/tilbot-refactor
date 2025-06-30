<script lang="ts">
  import ChatHeader from "./ChatHeader.svelte";
  import type { ChatSettings } from "../../../../common/ChatSettings";
  import type { RuntimeContext } from "$lib/types/RuntimeContext";

  type CombinedProps = {
    settings: ChatSettings;
    runtimeContext: RuntimeContext;
  };

  let { settings, runtimeContext }: CombinedProps = $props();
</script>

<div class="flex flex-col w-full h-full">
  {#if runtimeContext.showHeader}
    <ChatHeader
      name={settings.name}
      showAvatar={settings.showAvatar}
      avatarFile={settings.avatarFile}
      path={runtimeContext.path}
    />
  {/if}
</div>
