<script lang="ts">
  import { firstLetter } from "$lib/utils/functions";
  /**
   * @prop visible: determines whether or not component is shown
   * @prop showAvatar: determines whether avatar is shown or not
   * @prop avatarFile: defines the filename of the avatar chosen by the user
   * @prop name: name of the user
   * @prop path: path to the avatar directory
   */
  let {
    visible = true,
    showAvatar = false,
    avatarFile = "",
    name = "",
    path = "",
  }: {
    visible: boolean;
    showAvatar: boolean;
    avatarFile: string;
    name: string;
    path: string;
  } = $props();
</script>

{#if visible}
  <div class="bg-gray-100 w-full top-0 h-20 left-0 drop-shadow">
    {#if showAvatar}
      <div class="avatar online placeholder mt-4 ml-4 w-12 float-left">
        {#if avatarFile == ""}
          <div class="bg-neutral-focus text-neutral-content rounded-full w-12">
            <span>{firstLetter(name)}</span>
          </div>
        {:else}
          <div class="rounded-full w-12">
            <img src="{path}avatar/{avatarFile}" alt="Avatar" />
          </div>
        {/if}
      </div>
    {/if}
    <div class="text-lg font-medium mt-6 ml-4 float-left">
      {name}
    </div>
  </div>
{/if}
