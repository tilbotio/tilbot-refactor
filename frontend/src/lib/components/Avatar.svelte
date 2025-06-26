<script lang="ts">
  import { firstLetter } from "$lib/utils/functions";
  let { avatarFile, path, name } = $props();
</script>

{#if avatarFile}
  <div class="rounded-full w-12">
    <img src="{path}avatar/{avatarFile}" alt="Avatar for {name}" />
  </div>
{:else}
  <div class="bg-neutral-focus text-neutral-content rounded-full w-12">
    <span>{firstLetter(name)}</span>
  </div>
{/if}
