<script lang="ts">
  import type { ProjectBlock } from "../../../../../common/project/types.ts";
  import BaseBlockPopup from "./base.svelte";
  import Connectors from "./components/connectors.svelte";
  import { Sparkles } from "svelte-heros-v2";

  const {
    block,
    variables,
    save = (block: ProjectBlock) => {},
    cancel = () => {},
  } = $props();
</script>

<BaseBlockPopup Icon={Sparkles} {block} {variables} {save} {cancel}>
  {#snippet children(blockCopy: ProjectBlock)}
    Answer options:<br />
    <Connectors connectors={blockCopy.connectors} {variables} />
  {/snippet}
</BaseBlockPopup>
