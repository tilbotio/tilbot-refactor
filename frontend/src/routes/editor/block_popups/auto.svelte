<script lang="ts">
  import type {
    ProjectBlock,
    ProjectEvent,
  } from "../../../../../common/project/types.ts";
  import BaseBlockPopup from "./base.svelte";
  import Connector from "./components/connector.svelte";
  import { Photo, Clock } from "svelte-heros-v2";

  const {
    block,
    save = (block: ProjectBlock) => {},
    cancel = () => {},
  } = $props();

  let showImageSelector = $state(false);
  let imageCopy = $state("");

  const defaultProjectBlock = {
    chatgpt_variation: false,
    variation_prompt:
      "Please generate a variation of the message the user sends, while preserving its original meaning. Try to be somewhat concise.",
  } as ProjectBlock;

  function toggleImageSelector() {
    showImageSelector = !showImageSelector;
  }

  function saveImage(blockCopy: ProjectBlock) {
    blockCopy.content += '<img src="' + imageCopy + '" />';
    showImageSelector = true;
    imageCopy = "";
  }

  function closeImage() {
    showImageSelector = false;
    imageCopy = "";
  }
</script>

<BaseBlockPopup Icon={Clock} {block} {defaultProjectBlock} {save} {cancel}>
  {#snippet children(blockCopy: ProjectBlock)}
    <p class="py-4">Text for the bot to say:</p>
    <button
      class="btn btn-square btn-outline btn-sm mt-2 mb-2"
      onclick={toggleImageSelector}><Photo class="w-6 h-6" /></button
    >

    {#if showImageSelector}
      <div class="bg-slate-200 p-4">
        <input
          type="text"
          placeholder="images/tilbot_logo.svg"
          class="input input-bordered input-sm w-full max-w-xs"
          bind:value={imageCopy}
        />
        <button
          class="btn btn-active btn-sm"
          onclick={() => {
            saveImage(blockCopy);
          }}>Insert</button
        >
        <button class="btn btn-outline btn-sm" onclick={closeImage}
          >Cancel</button
        >
      </div>
    {/if}

    <div
      class="textarea text-base textarea-bordered resize-none inset-y-2 w-full h-24 max-h-40 overflow-scroll"
      contenteditable="true"
      bind:innerHTML={blockCopy.content}
    ></div>

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
      {/if}
    </div>

    <Connector
      connector={blockCopy.connectors[0]}
      eventHeader="Event type"
      contentHeader="Content"
      eventAddLabel="Add event"
    >
      {#snippet eventSnippet(id: number, event: ProjectEvent)}
        <select
          bind:value={event.type}
          class="select select-bordered w-full max-w-xs"
        >
          <option selected value="message">Message to parent window</option>
          <option value="variable">Set variable</option>
        </select>
      {/snippet}

      {#snippet contentSnippet(id: number, event: ProjectEvent)}
        {#if event.type == "message"}
          <input
            type="text"
            placeholder="Message to send to parent window"
            class="input input-bordered w-full max-w-xs"
            bind:value={event.content}
          />
          >
        {:else}
          <input
            type="text"
            placeholder="Variable"
            class="input input-bordered max-w-xs"
            bind:value={event.var_name}
          />
          =
          <input
            type="text"
            placeholder="Value"
            class="input input-bordered max-w-xs"
            bind:value={event.var_value}
          />
        {/if}
      {/snippet}
    </Connector>
  {/snippet}
</BaseBlockPopup>
