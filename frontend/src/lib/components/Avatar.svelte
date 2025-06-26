<script lang="ts">
  import { firstLetter } from "$lib/utils/functions";
  let { avatarFile, path, name } = $props();
</script>

<div
  class="w-full h-full rounded-full overflow-hidden text-neutral-content flex items-center justify-center bg-neutral-focus"
>
  {#if avatarFile}
    <img
      src="{path}avatar/{avatarFile}"
      alt={`Avatar for ${name}`}
      class="w-full h-full object-cover"
    />
  {:else}
    <span>{firstLetter(name)}</span>
  {/if}
</div>
