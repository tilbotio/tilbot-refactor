<script lang="ts">
  import { Clock } from "svelte-heros-v2";
  import BaseBlock, { type BlockProps } from "./base.svelte";
  import {
    ChatBubbleLeft,
    EllipsisHorizontalCircle,
    Variable,
  } from "svelte-heros-v2";

  let { block, lineLocation = $bindable(), ...props }: BlockProps = $props();
</script>

<BaseBlock Icon={Clock} {block} bind:lineLocation {...props}>
  {#each block.content as v}
    {#if v.type !== undefined && v.type == "prevTurnText"}
      <div class="badge badge-secondary mx-2">
        <ChatBubbleLeft class="w-3 h-3" /> Previous turn text
      </div>
    {:else if v.type !== undefined && v.type == "prevConnectorLabel"}
      <div class="badge badge-neutral mx-2">
        <EllipsisHorizontalCircle class="w-3 h-3" /> Previous connector label
      </div>
    {:else}
      <div class="inline-flex">{v.text}</div>
    {/if}
  {/each}
</BaseBlock>
