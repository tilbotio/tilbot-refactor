<script lang="ts">
  import CameraInput from "#lib/components/CameraInput.svelte";
  import SpeechInput from "#lib/components/SpeechInput.svelte";
  import type {
    InputText,
    CurrentMessageType,
    McOption,
  } from "#lib/types/types.ts";
  import { Microphone, PaperAirplane } from "svelte-heros-v2";
  type Props = {
    currentMessageType: CurrentMessageType;
    allowAudioReply?: boolean;
    forceAudioReply?: boolean;
    allowImageReply?: boolean;
    mcOptions: McOption[];
    onSend: (InputText: string, imageBlob: Blob | null) => void;
    onSendAudio: (audioBlob: Blob, transcription?: string) => void;
    onTranscribe: (audioBlob: Blob) => Promise<string | null>;
    canTranscribe: boolean;
  };

  let inputText: InputText = $state("");
  let speechMode: boolean = $state(false);
  let currentImage: Blob | null = $state(null);

  const {
    currentMessageType,
    allowAudioReply,
    forceAudioReply,
    allowImageReply,
    mcOptions,
    onSend,
    onSendAudio,
    onTranscribe,
    canTranscribe
  }: Props = $props();

  function handleTextSubmit(): void {
    // Check if there is an image to send as well.
    onSend(inputText, currentImage);
    inputText = "";
    currentImage = null;
    speechMode = false;
  }

  function handleMcSubmit(optionContent: string): void {
    onSend(optionContent, null);
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
  <SpeechInput
    {onSendAudio}
    {onTranscribe}
    onSwitchSpeechMode={forceAudioReply ? null : switchSpeechMode}
    {canTranscribe}
  />
{:else}
  <div class="bg-gray-100 w-full h-20 drop-shadow-md flex justify-center items-center">
    <textarea
      class="h-16 min-h-0 textarea resize-none inset-y-2 left-4 w-[calc(100%-5.5rem)]"
      placeholder=""
      bind:value={inputText}
      onkeydown={handleKeyDown}
    >
    </textarea>
    {#if allowAudioReply}
      <button
        class="absolute bottom-[28px] right-[92px] {inputText.trim().length == 0
          ? ''
          : 'invisible'}"
        aria-label="Switch to audio input"
        onclick={switchSpeechMode}><Microphone class="h-5 w-5" /></button
      >
    {/if}
    {#if allowImageReply}
      <CameraInput bind:currentImage />
    {/if}
    <button
      class="btn btn-circle ml-4 {inputText.trim()
        .length == 0 && currentImage === null
        ? 'btn-disabled'
        : ''}"
      aria-label="Send message"
      onclick={handleTextSubmit}><PaperAirplane class="h-6 w-6" /></button
    >
  </div>
{/if}
