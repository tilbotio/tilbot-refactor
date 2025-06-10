<script lang="ts">
  /**
   * @prop visible: determine whether or not component is shown
   * @prop onClose: callback function, will be provided by parent component
   */
  import { Icon, XMark } from "svelte-hero-icons";
  let {
    visible = false,
    onClose = () => {},
  }: { visible: boolean; onClose: () => void } = $props();
</script>

{#if visible}
  <div
    class="fixed top-0 left-0 w-full h-full bg-tilbot-secondary-purple z-50 flex flex-col justify-center text-white"
  >
    <button
      class="btn btn-circle absolute right-4 top-4 z-10 bg-white text-tilbot-secondary-purple hover:bg-white"
      aria-label="Close scanner"
      onclick={onClose}
    >
      <Icon src={XMark} class="h-6 w-6" />
    </button>
    <div id="barcodereader" class="!border-0 z-0"></div>
  </div>
{/if}
