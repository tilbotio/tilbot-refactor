<script lang="ts">
  import Avatar from "./Avatar.svelte";

  let { message, newBotMessageBlock } = $props();

  function determineBackground(author: string) {
    switch (author) {
      case "bot":
        return ["bg-tilbot-secondary-purple", "chat-start"];
      case "chatgpt":
        return ["bg-[#FFC500]", "chat-end"];
      default:
        return ["bg-tilbot-secondary-hardpink", "chat-end"];
    }
  }

  const [background, alignment] = determineBackground(message.from);
</script>

<div class="chat {alignment}">
  {#if newBotMessageBlock}
    <div class="chat-image avatar">
      <div class="w-10">
        <Avatar />
      </div>
    </div>
  {/if}
  <div class="chat-bubble {background}">{@html message.content}</div>
</div>
