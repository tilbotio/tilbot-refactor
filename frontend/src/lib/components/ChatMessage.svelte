<script lang="ts">
  import AudioMessage from "./AudioMessage.svelte";
  import Avatar from "./Avatar.svelte";
  import { getContext } from "svelte";
  import { SpeakerWave, Stop } from "svelte-heros-v2";
  import type { Message, NewBotMessageBlock } from "$lib/types/types";
  import type { ProjectSettings } from "../../../../common/project/types";
  const settings: ProjectSettings = getContext("settingsContext");

  type Props = {
    ttsCompleteEvent: Function;
    message: Message;
    newBotMessageBlock: NewBotMessageBlock;
  };

  let { ttsCompleteEvent, message, newBotMessageBlock }: Props = $props();

  let playingTTS: boolean = $state(false);

  function determineLayout(author: string): [string, string] {
    switch (author) {
      case "bot":
        return ["bg-tilbot-secondary-purple", "chat-start"];
      case "chatgpt":
        return ["bg-[#FFC500]", "chat-end"];
      default:
        return ["bg-tilbot-secondary-hardpink", "chat-end"];
    }
  }

  const [background, alignment] = determineLayout(message.from);

  function doTTS() {
    trySpeak();
  }

  function trySpeak() {
    if (!window.speechSynthesis.speaking) {
      let utterance = new SpeechSynthesisUtterance(message.content);
      utterance.lang = settings.language;
      window.speechSynthesis.speak(utterance);
      playingTTS = true;
      utterance.onend = (event) => {
        playingTTS = false;
        ttsCompleteEvent();
      };
    } else {
      setTimeout(trySpeak, 250);
    }
  }

  function stopTTS() {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
      ttsCompleteEvent();
    }
    playingTTS = false;
  }

  if (settings.tts_enabled && settings.tts_automatic) {
    trySpeak();
  }
</script>

{#if message.audio !== undefined}
  <AudioMessage {message} />
{:else if message.content !== ""}
  <div class="chat ml-2 mr-2 {alignment}">
    {#if newBotMessageBlock}
      <div class="chat-image avatar">
        <div class="w-10">
          <Avatar avatarSource={settings.avatar_file_sm} />
        </div>
      </div>
    {:else}
      <div class="w-10"></div>
    {/if}
    <div class="chat-bubble whitespace-pre-line {background}">
      {#if settings.tts_enabled}
        {#if playingTTS}
          <Stop class="h-4 w-4 inline mr-2" onclick={stopTTS} />
        {:else}
          <SpeakerWave class="h-4 w-4 inline mr-2" onclick={doTTS} />
        {/if}
      {/if}
      {message.content}
    </div>
  </div>
{/if}
