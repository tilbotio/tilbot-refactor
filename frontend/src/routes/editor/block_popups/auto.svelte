<script lang="ts">
  import type { ProjectBlock } from "../../../../../common/project/types.ts";
  import BaseBlockPopup from "./base.svelte";
  import Events from "./components/events.svelte";
  import RichTextEdit from "./components/richtextedit.svelte";
  import { Clock } from "svelte-heros-v2";

  const {
    block,
    variables,
    save = (block: ProjectBlock) => {},
    cancel = () => {},
  } = $props();

  const defaultProjectBlock = {} as ProjectBlock;

  function fixedBlock(): ProjectBlock {
    // Make sure we have exactly one connector and that this connector has an
    // events property. Make sure we treat the 'blocks' variable as read-only.
    const connectors = block.connectors;
    if (!connectors || !connectors.length) {
      return {
        ...block,
        connectors: [
          {
            type: "Basic",
            targets: [] as number[],
            events: [],
          },
        ],
      };
    }
    const connector0 = connectors[0];
    if (connector0.events) {
      if (connectors.length > 1) {
        return { ...block, connectors: [connector0] };
      } else {
        return block;
      }
    } else {
      return { ...block, connectors: [{ ...connector0, events: [] }] };
    }
  }
</script>

<BaseBlockPopup
  Icon={Clock}
  block={fixedBlock()}
  {variables}
  {defaultProjectBlock}
  {save}
  {cancel}
>
  {#snippet children(blockCopy: ProjectBlock)}
    <p class="py-4">Text for the bot to say:</p>
    <RichTextEdit bind:value={blockCopy.content} {variables} />

    <Events bind:events={blockCopy.connectors[0].events} />
  {/snippet}
</BaseBlockPopup>
