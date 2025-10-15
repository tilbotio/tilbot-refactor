<script lang="ts">
  import { ListBullet } from "svelte-heros-v2";
  import BaseBlock, { type BlockProps } from "./base.svelte";

  const {
    block,
    ...props
  }: BlockProps = $props();
</script>

<BaseBlock Icon={ListBullet} {block} {...props}>
  {@html block.content}
</BaseBlock>
