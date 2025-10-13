<script lang="ts">
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import { firstLetter } from "$lib/utils/functions";
  import type { ProjectSettings } from "../../../../common/project/types";
  import { getContext } from "svelte";

  const settings: ProjectSettings = getContext("settingsContext");
  const runtimeContext: RuntimeContext = getContext("runtimeContext");

  type Props = {
    avatarSource:
      | ProjectSettings["avatar_file"]
      | ProjectSettings["avatar_file_sm"];
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
