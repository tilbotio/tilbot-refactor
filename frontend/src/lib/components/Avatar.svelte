<script lang="ts">
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import { firstLetter } from "$lib/utils/functions";
  import type { ChatSettings } from "../../../../common/ChatSettings";
  import { getContext } from "svelte";

  const settings: ChatSettings = getContext("settingsContext");
  const runtimeContext: RuntimeContext = getContext("runtimeContext");

  type Props = {
    avatarSource:
      | ChatSettings["avatarFile"]
      | ChatSettings["chatbotAvatarFile"];
  };

  let { avatarSource }: Props = $props();
</script>

<div
  class="w-full h-full rounded-full overflow-hidden text-neutral-content flex items-center justify-center bg-neutral-focus"
>
  {#if avatarSource}
    <img
      src="{runtimeContext.path}avatar/{avatarSource}"
      alt={`Avatar for ${settings.name}`}
      class="w-full h-full object-cover"
    />
  {:else}
    <span>{firstLetter(settings.name ?? "")}</span>
  {/if}
</div>
