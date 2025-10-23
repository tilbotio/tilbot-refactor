<script lang="ts">
  import type {
    ProjectBlock,
    ProjectEvent,
  } from "../../../../../common/project/types.ts";
  import { Trash, Photo, Clock, Plus, Bolt } from "svelte-heros-v2";

  const {
    block,
    save = (block: ProjectBlock) => {},
    cancel = () => {},
  } = $props();

  let blockCopy = $state({}) as ProjectBlock;

  let eventsModal: HTMLInputElement;
  let eventsCopy = $state([]) as ProjectEvent[];
  let selectedConnectorId = $state(-1);

  let showImageSelector = $state(false);
  let imageCopy = $state("");

  const defaultProjectBlock = {
    chatgpt_variation: false,
    variation_prompt:
      "Please generate a variation of the message the user sends, while preserving its original meaning. Try to be somewhat concise.",
  };

  $effect(() => {
    blockCopy = JSON.parse(
      JSON.stringify(Object.assign({}, defaultProjectBlock, block))
    );
  });

  function ignoreEnterKey(e: KeyboardEvent) {
    if (e.key == "Enter") {
      e.preventDefault();
    }
  }
  function addEvent() {
    eventsCopy.push({
      type: "message",
      content: "",
    });
  }

  function removeEvent(id: number) {
    eventsCopy.splice(id, 1);
  }

  function editEvents(id: number) {
    selectedConnectorId = id;
    eventsCopy = JSON.parse(
      JSON.stringify(blockCopy.connectors[id].events ?? [])
    );
    eventsModal.click();
  }

  function saveEvents() {
    blockCopy.connectors[selectedConnectorId].events = eventsCopy;
    eventsModal.click();
  }

  function closeEvents() {
    eventsModal.click();
  }

  function toggleImageSelector() {
    showImageSelector = !showImageSelector;
  }

  function saveImage() {
    blockCopy.content += '<img src="' + imageCopy + '" />';
    showImageSelector = true;
    imageCopy = "";
  }

  function closeImage() {
    showImageSelector = false;
    imageCopy = "";
  }
</script>

<input
  type="checkbox"
  id="modal-event"
  class="modal-toggle"
  bind:this={eventsModal}
/>
<div class="modal">
  <div class="modal-box max-w-3xl">
    <h3 class="font-bold text-lg">Events for connector</h3>

    {#if eventsCopy.length > 0}
      <table class="table table-zebra w-full mt-2">
        <!-- head -->
        <thead>
          <tr>
            <th>Event type</th>
            <th>Content</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each eventsCopy.entries() as [id, event]}
            <tr>
              <td>
                <select
                  bind:value={event.type}
                  class="select select-bordered w-full max-w-xs"
                >
                  <option selected value="message"
                    >Message to parent window</option
                  >
                  <option value="variable">Set variable</option>
                </select>
              </td>
              <!-- @TODO: different inputs for different event types -->
              {#if event.type == "message"}
                <td
                  ><input
                    type="text"
                    placeholder="Message to send to parent window"
                    class="input input-bordered w-full max-w-xs"
                    bind:value={event.content}
                  /></td
                >
                <td>
                  <button
                    class="btn btn-square btn-outline btn-sm"
                    onclick={() => {
                      removeEvent(id);
                    }}><Trash class="w-6 h-6" /></button
                  >
                </td>
              {:else}
                <td>
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
                </td>
                <td>
                  <button
                    class="btn btn-square btn-outline btn-sm"
                    onclick={() => {
                      removeEvent(id);
                    }}><Trash class="w-6 h-6" /></button
                  >
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}

    <br /><br />

    <button class="btn gap-2" onclick={addEvent}>
      <Plus class="w-6 h-6"/>
      Add event
    </button>

    <div class="divider"></div>
    <div class="modal-action">
      <div class="btn" onclick={saveEvents}>Save</div>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <div class="btn btn-outline" onclick={closeEvents}>Cancel</div>
    </div>
  </div>
</div>

<label
  for="my-modal-3"
  class="btn btn-sm btn-circle absolute right-2 top-2"
  onclick={() => {
    cancel();
  }}>✕</label
>

<h3 class="text-lg font-bold">
  <Clock class="w-6 h-6" />
  <div
    class="inline"
    contenteditable="true"
    bind:textContent={blockCopy.name}
    onkeypress={ignoreEnterKey}
  ></div>
</h3>
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
    <button class="btn btn-active btn-sm" onclick={saveImage}>Insert</button>
    <button class="btn btn-outline btn-sm" onclick={closeImage}>Cancel</button>
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
    <span class="label-text">Use large language model to add variation</span>
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

<br />

<button
  class="btn btn-square btn-sm {blockCopy.connectors[0]?.events === undefined
    ? 'btn-outline'
    : ''}"
  onclick={() => {
    editEvents(0);
  }}
><Bolt class="w-6 h-6"/></button>

<div class="divider"></div>
<p>
  <button
    class="btn btn-active"
    onclick={() => {
      save();
    }}>Save</button
  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button
    class="btn btn-outline"
    onclick={() => {
      cancel();
    }}>Cancel</button
  >
</p>
