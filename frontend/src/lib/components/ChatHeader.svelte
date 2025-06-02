<script lang="ts">
  // Props:
  //  • show: whether to render the header at all
  //  • settings: an object containing show_avatar, avatar_file, and name
  //  • path: base URL path used to build the <img> src when an avatar file exists
  export let show = true;
  export let settings: {
    show_avatar: 'yes' | 'no';
    avatar_file: string;
    name: string;
  } = {
    show_avatar: 'yes',
    avatar_file: '',
    name: 'Tilbot'
  };
  export let path = '';

  function firstletter(str: string) {
    return str.charAt(0).toUpperCase();
  }
</script>

{#if show}
  <div class="bg-gray-100 w-full top-0 h-20 left-0 drop-shadow" >
    {#if settings.show_avatar === 'yes'}
      <div class="avatar online placeholder mt-4 ml-4 w-12 float-left">
        {#if settings.avatar_file === ''}
          <div class="bg-neutral-focus text-neutral-content rounded-full w-12 h-12 flex items-center justify-center">
            <span>{firstletter(settings.name)}</span>
          </div>
        {:else}
          <div class="rounded-full w-12 h-12 overflow-hidden">
            <img src="{path + 'avatar/' + settings.avatar_file}" alt="avatar" class="w-full h-full object-cover" />
          </div>
        {/if}
      </div>
    {/if}
    <div class="text-lg font-medium mt-6 ml-4 float-left">
      {settings.name}
    </div>
  </div>
{/if}
