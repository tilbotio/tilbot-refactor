<script lang="ts">
  import AudioMessage from "./AudioMessage.svelte";
  import Avatar from "./Avatar.svelte";
  import { getContext } from "svelte";
  import { SpeakerWave, Stop } from "svelte-heros-v2";
  import SvelteMarkdown from "@humanspeak/svelte-markdown";
  import type { Message, NewBotMessageBlock } from "#lib/types/types.ts";
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

      for (const voice of window.speechSynthesis.getVoices()) {
        if (settings.language === "nl-NL" && voice.lang === "nl-NL" && voice.name.includes("Colette")) {
          utterance.voice = voice;
          break;
        }
      }

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

  if (settings && settings.tts_enabled && settings.tts_automatic && message.from === "bot") {
    trySpeak();
  }
</script>

{#if message.audio !== undefined}
  <AudioMessage {message} />
{:else if message.content !== "" || message.image !== undefined}
  <div class="chat ml-2 mr-2 {alignment}">
    {#if newBotMessageBlock && settings.show_avatar_sm}
      <div class="chat-image avatar">
        <div class="w-10">
          <Avatar avatarSource={settings.avatar_file_sm} />
        </div>
      </div>
    {:else}
      <div class="w-2"></div>
    {/if}
    <div class="chat-bubble whitespace-pre-line text-white {background}">
      <div class="flex items-start">
        {#if settings && settings.tts_enabled}
          {#if playingTTS}
            <Stop class="h-4 w-4 mr-2 mt-1 shrink-0" onclick={stopTTS} />
          {:else}
            <SpeakerWave class="h-4 w-4 mr-2 mt-1 shrink-0" onclick={doTTS} />
          {/if}
        {/if}
        <div>
          <SvelteMarkdown source={message.content}>
              {#snippet link({ href, title, children })}
                  <a {href} {title} target="_blank" rel="noopener noreferrer">
                      {@render children?.()}
                  </a>
              {/snippet}
          </SvelteMarkdown>
        </div>
      </div>
      {#if message.image !== undefined}
        <img src={URL.createObjectURL(message.image)} alt="Attachment to message" class="mt-2" />
      {/if}
    </div>
  </div>
{/if}
