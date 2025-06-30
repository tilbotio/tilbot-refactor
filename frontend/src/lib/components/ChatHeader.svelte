<script lang="ts">
  import Avatar from "./Avatar.svelte";
  import type { ChatSettings } from "../../../../common/ChatSettings";
  import { getContext } from "svelte";

  const settings: ChatSettings = getContext("settingsContext");
</script>

<div class="bg-gray-100 w-full h-20 left-0 drop-shadow flex items-center px-4">
  {#if settings.showAvatar}
    <div class="avatar online placeholder w-12 h-12 mr-4">
      <Avatar />
    </div>
  {/if}
  <div class="text-lg font-medium">{settings.name}</div>
</div>
