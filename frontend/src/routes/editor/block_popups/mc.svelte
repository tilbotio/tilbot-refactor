<script lang="ts">
  import type {
    ProjectBlock,
    ProjectEvent,
  } from "../../../../../common/project/types.ts";
  import BaseBlockPopup from "./base.svelte";
  import Connector from "./components/connector.svelte";
  import { Photo, ListBullet } from "svelte-heros-v2";


  const {
    block,
    save = (block: ProjectBlock) => {},
    cancel = () => {},
  } = $props();
</script>

<BaseBlockPopup Icon={ListBullet} {block} {save} {cancel}>
  {#snippet children(blockCopy: ProjectBlock)}
  {/snippet}
</BaseBlockPopup>


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
      <Plus class="w-6 h-6" />

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
  <Clock style="display: inline; vertical-align: sub" class="w-6 h-6" />

  <div
    class="inline"
    contenteditable="true"
    bind:textContent={blockCopy.name}
    onkeypress={ignoreEnterKey}
  ></div>
</h3>

<div
  class="overflow-x-hidden overflow-y-auto"
  style="max-height: calc(100vh - 16em)"
>
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
      <button class="btn btn-outline btn-sm" onclick={closeImage}>Cancel</button
      >
    </div>
  {/if}
  <div
    class="textarea text-base textarea-bordered resize-none inset-y-2 w-full max-h-40 h-24 overflow-scroll"
    contenteditable="true"
    bind:innerHTML={blockCopy.content}
  ></div>

  <br /><br />

  Answer options:<br />
  {#if blockCopy.connectors?.length! > 0}
    <table class="table table-zebra w-full mt-2">
      <!-- head -->
      <thead>
        <tr>
          <th>Answer option</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each blockCopy.connectors.entries() as [id, connector]}
          <tr>
            <td
              ><input
                type="text"
                placeholder="Type here"
                class="input input-bordered w-full max-w-xs"
                bind:value={connector.label}
              /></td
            >
            <td>
              <button
                class="btn btn-square btn-sm {connector.events === undefined
                  ? 'btn-outline'
                  : ''}"
                onclick={() => {
                  editEvents(id);
                }}><Bolt class="w-6 h-6" /></button
              >
            </td>
            <td>
              <button
                class="btn btn-square btn-outline btn-sm"
                onclick={() => {
                  removeConnector(id);
                }}><Trash class="w-6 h-6" /></button
              >
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <br />

  <button class="btn gap-2" onclick={addConnector}>
    <Plus class="w-6 h-6" />

    Add answer option
  </button>
</div>
<div class="divider"></div>
<p>
  <button
    class="btn btn-active"
    onclick={() => {
      save(blockCopy);
    }}>Save</button
  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button
    class="btn btn-outline"
    onclick={() => {
      cancel();
    }}>Cancel</button
  >
</p>
