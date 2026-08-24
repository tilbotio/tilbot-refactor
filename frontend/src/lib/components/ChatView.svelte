<script lang="ts">
  import ChatHeader from "./ChatHeader.svelte";
  import type { ProjectControllerInterface } from "../../../../common/projectcontroller/types";
  import type { ChatOutput } from "$lib/classes/ChatOutput.svelte";
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import type { ProjectSettings } from "../../../../common/project/types";
  import type { McOption, Message, CurrentMessageType } from "$lib/types/types";
  import { getContext, tick } from "svelte";
  import MessageList from "./ChatMessageList.svelte";
  import InputArea from "./InputArea.svelte";

  type Props = {
    projectController: ProjectControllerInterface<ChatOutput>;
  };

  let { projectController }: Props = $props();

  const runtimeContext: RuntimeContext = getContext("runtimeContext");
  const settingsContext: ProjectSettings = getContext("settingsContext");
  const messages: Message[] = getContext("messagesContext");

  let currentMessageType: CurrentMessageType = $state("Auto");
  let allowAudioReply: boolean = $state(false);
  let forceAudioReply: boolean = $state(false);
  let mcOptions: McOption[] = $state([]);

  let scrollContainer: HTMLDivElement;

  $effect(() => {
    if (isTypingIndicatorActive || messages.length) {
      (async () => {
        await tick();
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      })();
    }

    if (messages.length) {
      // Check if we should update the input type.
      let latest = messages[messages.length - 1];

      if (latest.from == "bot") {
        currentMessageType = latest.type || "Auto";
        allowAudioReply = latest.params.allowAudioReply || false;
        forceAudioReply = latest.params.forceAudioReply || false;
        const newMcOptions = [];

        if (currentMessageType === "MC") {
          console.log(latest.params.options);
          for (const content of latest.params.options) {
            newMcOptions.push({ content });
          }
        }

        mcOptions = newMcOptions;
      }
    }
  });

  let isTypingIndicatorActive = $derived(
    projectController.output.isTypingIndicatorActive
  );

  function sendUserMessage(messageText: string): void {
    projectController.output.processMessage("user", messageText);
    // Reset currentMessageType to text by default
    currentMessageType = "Text";
  }

  function sendUserAudioMessage(audioBlob: Blob): void {
    projectController.output.processMessage(
      "user",
      "",
      null,
      "Text",
      audioBlob
    );
    // Reset currentMessageType to text by default
    currentMessageType = "Text";
    allowAudioReply = false;
    forceAudioReply = false;
  }

  function ttsComplete(): void {
    projectController.output.projectController?.message_sent_event();
  }
</script>

<div class="flex flex-col w-full h-full">
  {#if runtimeContext.showHeader}
    <ChatHeader />
  {/if}
  <div
    bind:this={scrollContainer}
    class="w-full h-full flex-1 overflow-y-scroll py-2"
  >
    <MessageList
      {isTypingIndicatorActive}
      ttsCompleteEvent={ttsComplete}
      avatar_file_sm={settingsContext.avatar_file_sm}
    />
  </div>
  <InputArea
    {currentMessageType}
    {mcOptions}
    {allowAudioReply}
    {forceAudioReply}
    onSend={sendUserMessage}
    onSendAudio={sendUserAudioMessage}
  />
</div>
