<script lang="ts">
  import type { ProjectBlock } from "../../../../../common/project/types.ts";
  import BaseBlockPopup from "./base.svelte";
  import Connectors from "./components/connectors.svelte";
  import RichTextEdit from "./components/richtextedit.svelte";
  import { Language } from "svelte-heros-v2";

  const {
    block,
    save = (block: ProjectBlock) => {},
    cancel = () => {},
  } = $props();

  const defaultProjectBlock = {
    chatgpt_variation: false,
    variation_prompt:
      "Please generate a variation of the message the user sends, while preserving its original meaning. Try to be somewhat concise.",
  } as ProjectBlock;
</script>

<BaseBlockPopup Icon={Language} {defaultProjectBlock} {block} {save} {cancel}>
  {#snippet children(blockCopy: ProjectBlock)}
    <p class="py-4">Text for the bot to say:</p>
    <RichTextEdit bind:value={blockCopy.content} />

    <br />

    <div class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text">Use large language model to add variation</span
        >
        <input
          type="checkbox"
          class="toggle"
          bind:checked={blockCopy.chatgpt_variation}
        />
      </label>

      {#if blockCopy.chatgpt_variation}
        <textarea
          class="textarea textarea-bordered w-full"
          bind:value={blockCopy.variation_prompt}
        ></textarea>

        <label class="label cursor-pointer">
          <span class="label-text">Keep memory of previous interactions</span>
          <input
            type="checkbox"
            class="toggle"
            bind:checked={blockCopy.chatgpt_memory}
          />
        </label>
      {/if}
    </div>

    <br /><br />

    Answer options:<br />
    <Connectors connectors={blockCopy.connectors} methodSelector={true} />
  {/snippet}
</BaseBlockPopup>
