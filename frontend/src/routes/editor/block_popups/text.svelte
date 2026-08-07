<script lang="ts">
  import type { ProjectBlockText } from "../../../../../common/project/types.ts";
  import BaseBlockPopup from "./base.svelte";
  import Connectors from "./components/connectors.svelte";
  import RichTextEdit from "./components/richtextedit.svelte";
  import { Language } from "svelte-heros-v2";

  const {
    block,
    variables,
    save = (block: ProjectBlockText) => {},
    cancel = () => {},
  } = $props();

  const defaultProjectBlock = {} as ProjectBlockText;
</script>

<BaseBlockPopup
  Icon={Language}
  {defaultProjectBlock}
  {block}
  {variables}
  {save}
  {cancel}
>
  {#snippet children(blockCopy: ProjectBlockText)}
    <p class="py-4">Text for the bot to say:</p>
    <RichTextEdit bind:value={blockCopy.content} {variables} />

    <br />
    <label class="label cursor-pointer">
      <span class="label-text">Allow the user to reply via audio messages.</span>
      <input
        type="checkbox"
        class="toggle"
        bind:checked={blockCopy.allow_audio_reply}
      />
    </label>    
    
    {#if blockCopy.allow_audio_reply}
      <label class="label cursor-pointer">
        <span class="label-text">Only allow audio messages (no text).</span>
        <input
          type="checkbox"
          class="toggle"
          bind:checked={blockCopy.force_audio_reply}
        />
      </label>    
    {/if}

    <br /><br />

    Answer options:<br />
    <Connectors connectors={blockCopy.connectors} {variables} />
  {/snippet}
</BaseBlockPopup>
