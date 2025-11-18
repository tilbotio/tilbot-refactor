<script lang="ts">
  import type { ProjectBlock } from "../../../../../common/project/types.ts";
  import BaseBlockPopup from "./base.svelte";
  import Connectors from "./components/connectors.svelte";
  import RichTextEdit from "./components/richtextedit.svelte";
  import { BellAlert } from "svelte-heros-v2";

  const {
    block,
    save = (block: ProjectBlock) => {},
    cancel = () => {},
  } = $props();
</script>

<BaseBlockPopup Icon={BellAlert} {block} {save} {cancel}>
  {#snippet children(blockCopy: ProjectBlock)}
    Answer options:<br />
    <Connectors connectors={blockCopy.connectors} />
  {/snippet}
</BaseBlockPopup>
