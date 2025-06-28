<script lang="ts">
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import type { ChatSettings } from "../../../../common/ChatSettings";
  import ChatHeader from "./ChatHeader.svelte";

  // Here we use a new interface to receive the props and type them properly
  // Another method of doing it instead of contexts; both can be useful in this project.
 
  interface AllProps {
    showHeader: boolean;
    runtimeContext: RuntimeContext;
    settings: ChatSettings;
  }

  //import Avatar from "./Avatar.svelte";
  //let { name, showAvatar, avatarFile, path } = $props();
  let { showHeader, runtimeContext, settings }: AllProps = $props()
</script>

<div class="bg-gray-100 w-full h-20 left-0 drop-shadow flex items-center px-4">
  {#if showHeader}  
    <p>Hi there, I am a chatheader! And this comes from runtimeContext: {runtimeContext.path}</p>    
  {/if}
</div>
