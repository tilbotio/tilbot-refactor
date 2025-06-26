<script lang="ts">
  import ChatHeader from "./ChatHeader.svelte";
  let { showHeader, participantId, projectId, path, settings, conversationId } =
    $props();
</script>

<div class="flex flex-col w-full h-full">
  {#if showHeader}
    <ChatHeader
      name={settings.name}
      showAvatar={settings.showAvatar}
      avatarFile={settings.avatarFile}
      {path}
    />
  {/if}
</div>
