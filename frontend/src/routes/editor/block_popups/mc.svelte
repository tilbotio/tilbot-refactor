<script lang="ts">
  import type { ProjectBlock } from "../../../../../common/project/types.ts";
  import BaseBlockPopup from "./base.svelte";
  import Connectors from "./components/connectors.svelte";
  import RichTextEdit from "./components/richtextedit.svelte";
  import { ListBullet } from "svelte-heros-v2";

  const {
    block,
    save = (block: ProjectBlock) => {},
    cancel = () => {},
  } = $props();
</script>

<BaseBlockPopup Icon={ListBullet} {block} {save} {cancel}>
  {#snippet children(blockCopy: ProjectBlock)}
    <p class="py-4">Text for the bot to say:</p>
    <RichTextEdit bind:value={blockCopy.content} />

    <br /><br />

    Answer options:<br />
    <Connectors connectors={blockCopy.connectors} />
  {/snippet}
</BaseBlockPopup>
