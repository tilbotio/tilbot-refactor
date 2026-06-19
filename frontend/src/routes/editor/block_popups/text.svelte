<script lang="ts">
  import type { ProjectBlock } from "../../../../../common/project/types.ts";
  import BaseBlockPopup from "./base.svelte";
  import Connectors from "./components/connectors.svelte";
  import RichTextEdit from "./components/richtextedit.svelte";
  import { Language } from "svelte-heros-v2";

  const {
    block,
    variables,
    save = (block: ProjectBlock) => {},
    cancel = () => {},
  } = $props();

  const defaultProjectBlock = {} as ProjectBlock;
</script>

<BaseBlockPopup
  Icon={Language}
  {defaultProjectBlock}
  {block}
  {variables}
  {save}
  {cancel}
>
  {#snippet children(blockCopy: ProjectBlock)}
    <p class="py-4">Text for the bot to say:</p>
    <RichTextEdit bind:value={blockCopy.content} {variables} />

    <br /><br />

    Answer options:<br />
    <Connectors connectors={blockCopy.connectors} {variables} />
  {/snippet}
</BaseBlockPopup>
