<script lang="ts">
  import ChatMessage from "./ChatMessage.svelte";
  import type { Message } from "$lib/types/types";

  type Props = {
    messages: Message[];
  };

  let { messages }: Props = $props();
</script>

{#each messages as message, index}
  <!-- if this is the start of a new message block for the bot, ChatMessage should be told to display the bot avatar-->
  {@const newBotMessageBlock: boolean =
    message.from == "bot" && (index == 0 || messages[index - 1].from != "bot")}

  <ChatMessage {message} {newBotMessageBlock} />
{/each}
