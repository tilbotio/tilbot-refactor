<script lang="ts">
  import { PaperAirplane, Plus, QrCode } from "svelte-heros-v2";
  type Props = {
    inputMode: "text" | "mc";
  };

  const { inputMode }: Props = $props();
</script>
