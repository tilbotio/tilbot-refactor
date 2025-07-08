<script lang="ts">
  import ChatHeader from "./ChatHeader.svelte";
  import BarcodeScanner from "./BarcodeScanner.svelte";
  import type { RuntimeContext } from "$lib/types/RuntimeContext";
  import { getContext } from "svelte";
  import MessageList from "./MessageList.svelte";
  import type { InputMode, ShowBarcodeScanner } from "$lib/types/types";
  import InputArea from "./InputArea.svelte";

  const runtimeContext: RuntimeContext = getContext("runtimeContext");

  let showBarcodeScanner: ShowBarcodeScanner = $state(false);
  let inputMode: InputMode = $state("text");

  // let messages: Array<any> = $state([]);
  // Messages array below is for testing purposes only, replace with line above after development.
  let messages: Array<any> = $state([
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

  function closeBarcodeReader(): void {
    showBarcodeScanner = false;
  }

  function handleScannedCode(decoded: string): void {
    // Bug with receive_message not defined on BasicProjectController, hence this intermediate debug fix
    // user_message(`barcode: ${decoded}`);
    console.log(`Code scanned: ${decoded}`);
  }

  //Temporary sendMessage function to test functionality between components
  function sendUserMessage(messageText: string): void {
    messages.push({ from: "user", content: messageText });
  }
</script>

{#if showBarcodeScanner}
  <BarcodeScanner onClose={closeBarcodeReader} onScan={handleScannedCode} />
{/if}

<div class="flex flex-col w-full h-full">
  {#if runtimeContext.showHeader}
    <ChatHeader />
  {/if}
  <div class="w-full h-full flex-1 overflow-y-scroll py-2">
    <MessageList {messages} />
  </div>
  <InputArea {inputMode} />
</div>
