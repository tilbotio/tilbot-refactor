<script lang="ts">
  let { message } = $props();

  function determineBackground(author: string) {
    switch (author) {
      case "bot":
        return "bg-tilbot-secondary-purple";
      case "chatgpt":
        return "bg-[#FFC500]";
      default:
        return "bg-tilbot-secondary-hardpink";
    }
  }

  const background: string = determineBackground(message.from);
</script>

<div class="chat-bubble {background}">{@html message.content}</div>
