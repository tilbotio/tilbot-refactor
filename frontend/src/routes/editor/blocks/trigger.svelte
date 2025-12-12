<script lang="ts">
  import { BellAlert } from "svelte-heros-v2";
  import BaseBlock, { type BlockProps } from "./base.svelte";

  let { lineLocation = $bindable(), ...props }: BlockProps = $props();
</script>

<BaseBlock Icon={BellAlert} bind:lineLocation {...props} />
