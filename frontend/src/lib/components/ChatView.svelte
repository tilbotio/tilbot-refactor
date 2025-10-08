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
  } from "$lib/types/types";
  import InputArea from "./InputArea.svelte";
  import { ChatOutput } from "../classes/ChatOutput.svelte";
  import { RemoteProjectController } from "../../../../common/projectcontroller/remote";
  import type { ProjectSettings } from "../../../../common/project/types";

  const runtimeContext: RuntimeContext = getContext("runtimeContext");
  const settingsContext: ProjectSettings = getContext("settingsContext");

  const chatOutput = new ChatOutput(settingsContext, runtimeContext);
  const projectController = new RemoteProjectController(chatOutput);

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

  // Messages array below is for testing purposes only, replace with line above after development.
  /* let messages: Array<any> = $state([
    { from: "bot", content: "Hi there! I am a bot." },
    { from: "user", content: "Hi there bot, I am a user!" },
    { from: "bot", content: "Well hello there user!" },
    {
      from: "bot",
      content: "What a pleasure to see you. Did you bring a friend?",
    },
    { from: "chatgpt", content: "Wassup bruh?" },
    { from: "user", content: "Go away, and stop stealing the biccies" },
    {
      from: "user",
      content:
        "No, I mean it, I can you see munching away on my biscuits. Shoo!",
    },
    { from: "chatgpt", content: "Geez, chill already, I am outta here" },
    {
      from: "bot",
      content: "Well, you do not see that every day.. let's get started!",
    },
  ]);
 */
  function openBarcodeReader(): void {
    showBarcodeScanner = true;
  }

  function closeBarcodeReader(): void {
    showBarcodeScanner = false;
  }

  function handleScannedCode(decoded: string): void {
    const messageText = `barcode: {$decoded}`;
    projectController.output.messages.push({
      from: "user",
      content: messageText,
    });
    projectController.receive_message(messageText);
  }

  //Temporary sendMessage function to test functionality between components
  function sendUserMessage(messageText: string): void {
    projectController.output.messages.push({
      from: "user",
      content: messageText,
    });
    // Reset currentMessageType to text by default
    currentMessageType = "text";
  }

  // Temporary testing functions
  // TODO: Remove after testing

  async function botmessage() {
    const message = {
      type: "Text",
      content: "Hi there, this is the bot speaking",
      params: null,
    };
    await projectController.output.botMessage(message);
  }
  async function botmessage2() {
    const message = {
      type: "Text",
      content: "Hi there, this is the second message from the chatbot!",
      params: null,
    };
    await projectController.output.botMessage(message);
  }
  function chatgptmessage() {
    projectController.output.messages.push({
      from: "chatgpt",
      content: "My first chatgptmessage!",
    });
  }

  function usermessage() {
    projectController.output.messages.push({
      from: "user",
      content: "My first usermessage!",
    });
  }

  // Remove all functions between here and TODO
</script>

<button onclick={botmessage}>Botmessage</button>
<button onclick={botmessage2}>Botmessage2</button>
<button onclick={chatgptmessage}>Chatgptmessage</button>
<button onclick={usermessage}>Usermessage</button>
<!-- This section above is for testing purposes only, remove later-->
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
    />
  </div>
  <InputArea
    {currentMessageType}
    {mcOptions}
    onSend={sendUserMessage}
    onScanner={openBarcodeReader}
  />
</div>
