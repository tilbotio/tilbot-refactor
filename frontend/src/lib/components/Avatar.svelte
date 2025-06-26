<script lang="ts">
  import { firstLetter } from "$lib/utils/functions";
  let { avatarFile, path, name } = $props();
</script>

<div
  class="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
>
  {#if avatarFile}
    <img
      src="{path}avatar/{avatarFile}"
      alt={`Avatar for ${name}`}
      class="w-full h-full object-cover"
    />
  {:else}
    <div
      class="w-full h-full bg-neutral-focus text-neutral-content flex items-center justify-center"
    >
      <span>{firstLetter(name)}</span>
    </div>
  {/if}
</div>
