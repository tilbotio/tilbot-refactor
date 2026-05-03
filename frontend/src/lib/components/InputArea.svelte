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
  };

  let inputText: InputText = $state("");

  const { currentMessageType, mcOptions, onSend }: Props = $props();

  function handleTextSubmit(): void {
    console.log("Text submitted");
    console.log(inputText);
    onSend(inputText);
    inputText = "";
  }

  function handleMcSubmit(optionContent: string): void {
    onSend(optionContent);
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (inputText.trim() === "") {
        return;
      } else {
        handleTextSubmit();
      }
    }
  }
</script>

{#if currentMessageType === "MC"}
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
      onkeydown={handleKeyDown}
    ></textarea>
    <button
      class="btn btn-circle absolute bottom-4 right-4 {inputText.trim()
        .length == 0
        ? 'btn-disabled'
        : ''}"
      aria-label="Send message"
      onclick={handleTextSubmit}><PaperAirplane class="h-6 w-6" /></button
    >
  </div>
{/if}
