<script lang="ts">
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import type { AvatarContext } from "$lib/types/types";
  import { firstLetter } from "$lib/utils/functions";
  import type { ChatSettings } from "../../../../common/ChatSettings";
  import { getContext } from "svelte";

  const settings: ChatSettings = getContext("settingsContext");
  const runtimeContext: RuntimeContext = getContext("runtimeContext");

  type Props = {
    avatarContext: AvatarContext;
  };

  // Avatarfile to be used depends on context (chatbotAvatarFile for chatmessages, avatarFile for the header)

  let { avatarContext }: Props = $props();

  const avatarFile: string | null =
    avatarContext == "chatmessage"
      ? settings.chatbotAvatarFile
      : settings.avatarFile;
</script>

<div
  class="w-full h-full rounded-full overflow-hidden text-neutral-content flex items-center justify-center bg-neutral-focus"
>
  {#if avatarFile}
    <img
      src="{runtimeContext.path}avatar/{avatarFile}"
      alt={`Avatar for ${settings.name}`}
      class="w-full h-full object-cover"
    />
  {:else}
    <span>{firstLetter(settings.name ?? "")}</span>
  {/if}
</div>
