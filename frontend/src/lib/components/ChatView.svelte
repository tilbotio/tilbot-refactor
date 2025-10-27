<script lang="ts">
  import ChatHeader from "./ChatHeader.svelte";
  import BarcodeScanner from "./BarcodeScanner.svelte";
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import { getContext, tick } from "svelte";
  import MessageList from "./ChatMessageList.svelte";
  import type {
    CurrentMessageType,
    McOption,
    ShowBarcodeScanner,
    Message,
  } from "$lib/types/types";
  import InputArea from "./InputArea.svelte";
  import { ChatOutput } from "../classes/ChatOutput.svelte";
  import { RemoteProjectController } from "../../../../common/projectcontroller/remote";
  import type { ProjectSettings } from "../../../../common/project/types";

  const runtimeContext: RuntimeContext = getContext("runtimeContext");
  const settingsContext: ProjectSettings = getContext("settingsContext");

  const chatOutput = new ChatOutput(settingsContext, runtimeContext);
  const projectController = new RemoteProjectController(chatOutput);

  chatOutput.projectController = projectController;

  let showBarcodeScanner: ShowBarcodeScanner = $state(false);
  let currentMessageType: CurrentMessageType = $state("text");
  let mcOptions: McOption[] = $state([]);

  let scrollContainer: HTMLDivElement;

  $effect(() => {
    if (isTypingIndicatorActive || projectController.output.messages.length) {
      (async () => {
        await tick();
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      })();
    }
  });

  let isTypingIndicatorActive = $derived(
    projectController.output.isTypingIndicatorActive
  );

  // Placeholder for upcoming functions to handle incoming messages and route them correctly
  function message_received() {
    return;
  }

  function openBarcodeReader(): void {
    showBarcodeScanner = true;
  }

  function closeBarcodeReader(): void {
    showBarcodeScanner = false;
  }

  function sendUserMessage(messageText: string): void {
    projectController.output.processMessage("user", messageText);
    // Reset currentMessageType to text by default
    currentMessageType = "text";
  }

  // Keep level of abstraction consistent
  function sendChatGPTMessage(messageText: string): void {
    projectController.output.processMessage("chatgpt", messageText);
  }

  function handleScannedCode(decoded: string): void {
    sendUserMessage(`barcode: ${decoded}`);
  }

  //Temporary testing functions, can be ignored during review.
  //TODO: Remove all testing functions below

  function botmessage() {
    const message = {
      type: "Text",
      content: "Hi there, this is the bot speaking",
      params: null,
    };
    projectController.output.botMessage(message);
  }

  function botmessage2() {
    const message = {
      type: "Text",
      content: "Hi there, this is the second message from the chatbot!",
      params: null,
    };
    projectController.output.botMessage(message);
  }

  function chatgptmessage() {
    sendChatGPTMessage("Hi! This is a message from ChatGPT");
  }

  function usermessage() {
    sendUserMessage("My first user message, hurrah!");
  }

  function testMC() {
    currentMessageType = "mc";
    mcOptions = [{ content: "A" }, { content: "B" }, { content: "C" }];
  }

  // Remove all functions between here and TODO
</script>

<button onclick={botmessage}>Botmessage</button>
<button onclick={botmessage2}>Botmessage2</button>
<button onclick={chatgptmessage}>Chatgptmessage</button>
<button onclick={usermessage}>Usermessage</button>
<button onclick={testMC}>MC Question</button>
<!-- This section above is for testing purposes only, remove later. Ignore during review-->
{#if showBarcodeScanner}
  <BarcodeScanner onClose={closeBarcodeReader} onScan={handleScannedCode} />
{/if}

<div class="flex flex-col w-full h-full">
  {#if runtimeContext.showHeader}
    <ChatHeader />
  {/if}
  <div
    bind:this={scrollContainer}
    class="w-full h-full flex-1 overflow-y-scroll py-2"
  >
    <MessageList
      messages={projectController.output.messages}
      {isTypingIndicatorActive}
      avatar_file_sm={settingsContext.avatar_file_sm}
    />
  </div>
  <InputArea
    {currentMessageType}
    {mcOptions}
    onSend={sendUserMessage}
    onScanner={openBarcodeReader}
  />
</div>
