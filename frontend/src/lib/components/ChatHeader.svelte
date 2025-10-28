<script lang="ts">
  import Avatar from "./Avatar.svelte";
  import type { ProjectSettings } from "../../../../common/project/types";
  import { getContext } from "svelte";

  const settings: ProjectSettings = getContext("settingsContext");
</script>

<div class="bg-gray-100 w-full h-20 left-0 drop-shadow flex items-center px-4">
  {#if settings.show_avatar}
    <div class="avatar online placeholder w-12 h-12 mr-4">
      <Avatar avatarSource={settings.avatar_file} />
    </div>
  {/if}
  <div class="text-lg font-medium">{settings.name}</div>
</div>
