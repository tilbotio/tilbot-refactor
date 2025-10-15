<script lang="ts">
  import { BellAlert } from "svelte-heros-v2";
  import BaseBlock, { type BlockProps } from "./base.svelte";

  const props: BlockProps = $props();
</script>

<BaseBlock Icon={BellAlert} {...props} />
