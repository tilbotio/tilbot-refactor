<script lang="ts">
  import { Sparkles } from "svelte-heros-v2";
  import BaseBlock, { type BlockProps } from "./base.svelte";
  import { ChatBubbleLeft, EllipsisHorizontalCircle } from "svelte-heros-v2";

  let { block, lineLocation = $bindable(), ...props }: BlockProps = $props();
</script>

<BaseBlock Icon={Sparkles} {block} bind:lineLocation {...props}></BaseBlock>
