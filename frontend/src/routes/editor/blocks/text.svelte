<script lang="ts">
  import { Language } from "svelte-heros-v2";
  import BaseBlock, { type BlockProps } from "./base.svelte";

  let { block, lineLocation = $bindable(), ...props }: BlockProps = $props();
</script>

<BaseBlock Icon={Language} {block} bind:lineLocation {...props}>
  {#if block.chatgpt_variation}
    <mark>
      {@html block.content}
    </mark>
  {:else}
    {@html block.content}
  {/if}
</BaseBlock>
