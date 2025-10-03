<script lang="ts">
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
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
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
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}

    <br /><br />

    <button class="btn gap-2" onclick={addEvent}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>

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
  <svg
    style="display: inline; vertical-align: sub"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-6 h-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5"
    />
  </svg>

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
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </button>
            </td>
            <td>
              <button
                class="btn btn-square btn-outline btn-sm"
                onclick={() => {
                  removeConnector(id);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <br />

  <button class="btn gap-2" onclick={addConnector}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-6 h-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>

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
