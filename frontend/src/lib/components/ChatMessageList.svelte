<script lang="ts">
  import ChatMessage from "./ChatMessage.svelte";
  import Avatar from "./Avatar.svelte";
  import type { Message } from "$lib/types/types";

  type Props = {
    messages: Message[];
    isTypingIndicatorActive: boolean;
  };

  let { messages, isTypingIndicatorActive }: Props = $props();

  function isNewBotMessageBlock(index: number): boolean {
    return index === 0 || messages[index - 1]?.from != "bot";
  }

  const showAvatarForTypingIndicator: boolean = $derived(
    isNewBotMessageBlock(messages.length)
  );
</script>

{#each messages as message, index}
  <ChatMessage
    {message}
    newBotMessageBlock={isNewBotMessageBlock(index) && message.from == "bot"}
  />
{/each}
{#if showAvatarForTypingIndicator}
  <p>NEW BOT BLOCK DETECTED!</p>
{/if}
{#if isTypingIndicatorActive}
  <div class="chat-bubble bg-tilbot-secondary-purple">
    <span class="loading loading-dots loading-sm"></span>
  </div>
{/if}
