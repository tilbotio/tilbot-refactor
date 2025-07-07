<script lang="ts">
  import ChatMessage from "./ChatMessage.svelte";

  let { messages } = $props();
</script>

{#each messages as message}
  <ChatMessage {message} />
{/each}
