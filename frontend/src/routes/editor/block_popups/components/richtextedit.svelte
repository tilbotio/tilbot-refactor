<script>
  import { Variable } from "svelte-heros-v2";

  let { value = $bindable() } = $props();
</script>

<button class="btn btn-square btn-outline btn-sm mt-2 mb-2">
  <Variable class="w-4 h-4" />
</button>
<div
  class="textarea text-base textarea-bordered resize-none inset-y-2 w-full max-h-40 h-24 overflow-scroll"
  contenteditable="plaintext-only"
  bind:innerHTML={value}
></div>
