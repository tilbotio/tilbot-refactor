<script lang="ts">
  import SpeechInput from "$lib/components/SpeechInput.svelte"
  import type {
    InputText,
    CurrentMessageType,
    McOption,
  } from "$lib/types/types";
  import { Microphone, PaperAirplane } from "svelte-heros-v2";
  type Props = {
    currentMessageType: CurrentMessageType;
    allowAudioReply?: boolean;
    forceAudioReply?: boolean;
    mcOptions: McOption[];
    onSend: (InputText: string) => void;
    onSendAudio: (audioBlob: Blob) => void;
  };

  let inputText: InputText = $state("");
  let speechMode: boolean = $state(false);

  const { currentMessageType, allowAudioReply, forceAudioReply, mcOptions, onSend, onSendAudio }: Props = $props();

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

  function switchSpeechMode(): void {
    speechMode = !speechMode;
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
{:else if forceAudioReply || speechMode}
  <SpeechInput onSendAudio={onSendAudio} onSwitchSpeechMode={forceAudioReply ? null : switchSpeechMode} />
{:else}
  <div class="bg-gray-100 w-full h-20 drop-shadow-md">
    <textarea
      class="relative top-2 h-16 textarea textarea-bordered resize-none inset-y-2 left-4 w-[calc(100%-5.5rem)]"
      placeholder=""
      bind:value={inputText}
      onkeydown={handleKeyDown}
    >   
    </textarea>
    {#if allowAudioReply || true}
    <button
      class="relative bottom-[14px] right-8 {inputText.trim()
        .length == 0
        ? ''
        : 'invisible'}"
      aria-label="Send message"
      onclick={switchSpeechMode}><Microphone class="h-5 w-5" /></button
    >        
    {/if} 
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
