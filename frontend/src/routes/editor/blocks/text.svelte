<script lang="ts">
  import { Language } from "svelte-heros-v2";
  import BaseBlock, { type BlockProps } from "./base.svelte";

  const {
    block,
    ...props
  }: BlockProps = $props();
</script>

<BaseBlock Icon={Language} {block} {...props}>
  {#if block.chatgpt_variation}
    <mark>
      {@html block.content}
    </mark>
  {:else}
    {@html block.content}
  {/if}
</BaseBlock>
