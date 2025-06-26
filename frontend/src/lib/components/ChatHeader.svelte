<script lang="ts">
  import { firstLetter } from "$lib/utils/functions";
  import Avatar from "./Avatar.svelte";
  let { name, showAvatar, avatarFile, path } = $props();
</script>

<div class="bg-gray-100 w-full top-0 h-20 left-0 drop-shadow">
  {#if showAvatar}
    <Avatar avatarFile path name />
  {/if}
  <div class="text-lg font-medium mt-6 ml-4 float-left">{name}</div>
</div>
