<script lang="ts">
  import { ListBullet } from "svelte-heros-v2";
  import BaseBlock, { type BlockProps } from "./base.svelte";

  let { block, lineLocation = $bindable(), ...props }: BlockProps = $props();
</script>

<BaseBlock Icon={ListBullet} {block} bind:lineLocation {...props}>
  {@html block.content}
</BaseBlock>
