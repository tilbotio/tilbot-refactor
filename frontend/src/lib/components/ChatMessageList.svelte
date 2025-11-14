<script lang="ts">
  import ChatMessage from "./ChatMessage.svelte";
  import Avatar from "./Avatar.svelte";
  import type { Message } from "$lib/types/types";
  import type { ProjectSettings } from "../../../../common/project/types";
  import { getContext } from "svelte";

  type Props = {
    isTypingIndicatorActive: boolean;
    avatar_file_sm: ProjectSettings["avatar_file_sm"];
  };

  let { isTypingIndicatorActive, avatar_file_sm }: Props = $props();

  const messages: Message[] = getContext("messagesContext")

  function isNewBotMessageBlock(index: number): boolean {
    return index === 0 || messages[index - 1]?.from != "bot";
  }

  const showAvatarForTypingIndicator: boolean = $derived(
    isNewBotMessageBlock(messages?.length ?? 0)
  );
</script>

{#each messages as message, index}
  <ChatMessage
    {message}
    newBotMessageBlock={isNewBotMessageBlock(index) && message.from == "bot"}
  />
{/each}
{#if isTypingIndicatorActive}
  <div class="chat chat-start">
    {#if showAvatarForTypingIndicator}
      <div class="chat-image avatar">
        <div class="w-10">
          <Avatar avatarSource={avatar_file_sm} />
        </div>
      </div>
    {/if}
    <div class="chat-bubble bg-tilbot-secondary-purple">
      <span class="loading loading-dots loading-sm"></span>
    </div>
  </div>
{/if}
