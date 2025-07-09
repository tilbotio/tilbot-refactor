<script lang="ts">
  import type {
    InputText,
    CurrentMessageType,
    McOption,
  } from "$lib/types/types";
  import { PaperAirplane, QrCode } from "svelte-heros-v2";
  type Props = {
    currentMessageType: CurrentMessageType;
    mcOptions: McOption[];
    onSend: (InputText: string) => void;
    onScanner: () => void;
  };

  let inputText: InputText = $state("");

  const { currentMessageType, mcOptions, onSend, onScanner }: Props = $props();

  function handleTextSubmit(): void {
    onSend(inputText);
    inputText = "";
  }

  function handleMcSubmit(optionContent: string): void {
    onSend(optionContent);
  }

  function openBarcodeReader(): void {
    onScanner();
  }
</script>

{#if currentMessageType === "mc"}
  <div class="bg-gray-100 w-full drop-shadow-md p-3 text-center">
    {#each mcOptions as option}
      <button
        class="btn btn-outline m-1"
        onclick={() => handleMcSubmit(option.content)}>{option.content}</button
      >
    {/each}
  </div>
{:else}
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
      <button
        class="btn btn-circle absolute bottom-4 right-4"
        aria-label="Scan barcode"
        onclick={openBarcodeReader}><QrCode class="h-6 w-6"></QrCode></button
      >
    {/if}
  </div>
{/if}
