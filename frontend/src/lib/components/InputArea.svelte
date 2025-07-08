<script lang="ts">
  import type { inputText } from "$lib/types/types";
  import { PaperAirplane, QrCode } from "svelte-heros-v2";
  type Props = {
    inputMode: "text" | "mc";
    onSend: (inputText: string) => void;
  };

  let inputText: inputText = $state("");

  const { inputMode, onSend }: Props = $props();

  function handleTextSubmit(): void {
    onSend(inputText);
    inputText = "";
  }
</script>

<div class="bg-gray-100 w-full h-20 drop-shadow-md">
  <textarea
    class="relative top-2 h-16 textarea textarea-bordered resize-none inset-y-2 left-4 w-[calc(100%-5.5rem)]"
    placeholder=""
    bind:value={inputText}
  ></textarea>
  {#if inputText && inputText.trim().length > 0}
    <button
      class="btn btn-circle absolute bottom-4 right-4"
      aria-label="Send message"
      onclick={handleTextSubmit}><PaperAirplane class="h-6 w-6" /></button
    >
  {:else}
    <!--TODO: Replace temporary handleTextSubmit with callback function from parent for opening the barcode scanner.-->
    <button
      class="btn btn-circle absolute bottom-4 right-4"
      aria-label="Scan barcode"
      onclick={handleTextSubmit}><QrCode class="h-6 w-6"></QrCode></button
    >
  {/if}
</div>
