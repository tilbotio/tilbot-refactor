<script lang="ts">
  import Avatar from "./Avatar.svelte";
  let { name, showAvatar, avatarFile, path } = $props();
</script>

<div class="bg-gray-100 w-full h-20 left-0 drop-shadow flex items-center px-4">
  {#if showAvatar}
    <div class="w-12 h-12 mr-4">
      <Avatar {avatarFile} {path} {name} />
    </div>
  {/if}
  <div class="text-lg font-medium">{name}</div>
</div>
