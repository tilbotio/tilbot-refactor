<script lang="ts">
  import { BellAlert, Bolt, Plus, Trash } from "svelte-heros-v2";
  import type {
    ProjectBlock,
    ProjectEvent,
  } from "../../../../../common/project/types.ts";

  const {
    block,
    save = (block: ProjectBlock) => {},
    cancel = () => {},
  } = $props();

  let blockCopy = $state({}) as ProjectBlock;

  let eventsModal: HTMLInputElement;
  let eventsCopy = $state([]) as ProjectEvent[];
  let selectedConnectorId = $state(-1);

  $effect(() => {
    blockCopy = JSON.parse(JSON.stringify(block));
  });

  function ignoreEnterKey(e: KeyboardEvent) {
    if (e.key == "Enter") {
      e.preventDefault();
    }
  }

  function addConnector() {
    blockCopy.connectors.push({
      type: "Labeled",
      label: "",
      targets: [],
    });
  }

  function removeConnector(id: number) {
    blockCopy.connectors.splice(id, 1);
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
  <BellAlert style="display: inline; vertical-align: sub" class="w-6 h-6" />

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
  <br />
  Answer options:<br />
  {#if blockCopy.connectors !== undefined && blockCopy.connectors.length > 0}
    <table class="table table-zebra w-full mt-2">
      <!-- head -->
      <thead>
        <tr>
          <th>Selection method</th>
          <th>User response to match with</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each blockCopy.connectors.entries() as [id, connector]}
          <tr>
            <td>
              <select
                bind:value={connector.method}
                class="select select-bordered w-full max-w-xs"
              >
                <option selected value="contains">Contains text</option>
                <option value="barcode">Barcode/QR scan</option>
              </select>
            </td>
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
