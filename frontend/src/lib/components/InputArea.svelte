<script lang="ts">
  import type { inputText } from "$lib/types/types";
  import { PaperAirplane, Plus, QrCode } from "svelte-heros-v2";
  type Props = {
    inputMode: "text" | "mc";
  };

  let inputText: inputText = $state("");

  const { inputMode }: Props = $props();
</script>

<div class="bg-gray-100 w-full h-20 drop-shadow-md">
  <textarea
    class="relative top-2 h-16 textarea textarea-bordered resize-none inset-y-2 left-4 w-[calc(100%-5.5rem)]"
    placeholder=""
    bind:value={inputText}
  ></textarea>
  {#if inputText}
    <button class="btn btn-circle absolute bottom-4 right-4">BUTTON</button>
  {/if}
</div>
