<script>
  import { Photo } from "svelte-heros-v2";

  let { value = $bindable() } = $props();

  let showImageSelector = $state(false);
  let imageCopy = $state("");

  function toggleImageSelector() {
    showImageSelector = !showImageSelector;
  }

  function saveImage() {
    value += `<img src="${imageCopy}"/>`;
    showImageSelector = false;
    imageCopy = "";
  }

  function closeImage() {
    showImageSelector = false;
    imageCopy = "";
  }
</script>

<button
  class="btn btn-square btn-outline btn-sm mt-2 mb-2"
  onclick={toggleImageSelector}><Photo class="w-6 h-6" /></button
>
{#if showImageSelector}
  <div class="bg-slate-200 p-4">
    <input
      type="text"
      placeholder="images/tilbot_logo.svg"
      class="input input-bordered input-sm w-full max-w-xs"
      bind:value={imageCopy}
    />
    <button class="btn btn-active btn-sm" onclick={saveImage}>Insert</button>
    <button class="btn btn-outline btn-sm" onclick={closeImage}>Cancel</button>
  </div>
{/if}
<div
  class="textarea text-base textarea-bordered resize-none inset-y-2 w-full max-h-40 h-24 overflow-scroll"
  contenteditable="true"
  bind:innerHTML={value}
></div>
