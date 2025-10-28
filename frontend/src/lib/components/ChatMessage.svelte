<script lang="ts">
  import Avatar from "./Avatar.svelte";
  import { getContext } from "svelte";
  import type { Message, NewBotMessageBlock } from "$lib/types/types";
  import type { ProjectSettings } from "../../../../common/project/types";
  const settings: ProjectSettings = getContext("settingsContext");

  type Props = {
    message: Message;
    newBotMessageBlock: NewBotMessageBlock;
  };

  let { message, newBotMessageBlock }: Props = $props();

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
</script>

<div class="chat {alignment}">
  {#if newBotMessageBlock}
    <div class="chat-image avatar">
      <div class="w-10">
        <Avatar avatarSource={settings.avatar_file_sm} />
      </div>
    </div>
  {/if}
  <div class="chat-bubble {background}">{@html message.content}</div>
</div>
