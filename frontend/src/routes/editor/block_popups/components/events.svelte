<script lang="ts">
  import _ from "lodash";

  import { Bolt, Plus, Trash, Variable } from "svelte-heros-v2";
  import type { ProjectEvent } from "../../../../../../common/project/types.js";
  import Variablepopup from "./variablepopup.svelte";

  let {
    events = $bindable(),
    variables,
  }: {
    events?: ProjectEvent[];
    variables: [];
  } = $props();

  let variablePopup: Variablepopup;
  let eventsModal: HTMLInputElement;
  let eventsCopy: ProjectEvent[] = $state([]);
  let currentEditingId: number = -1;

  $effect.pre(() => {
    eventsCopy = _.cloneDeep(events ?? []);
  });

  function editEvents() {
    eventsModal.click();
  }

  function addEvent() {
    eventsCopy.push({
      type: "message",
      content: "",
    });
  }

  function onChangeType(id: number) {
    if (eventsCopy[id].type == "message") {
      eventsCopy[id].var_name = undefined;
      eventsCopy[id].var_value = undefined;
      eventsCopy[id].content = "";
    } else {
      eventsCopy[id].content = "";
      eventsCopy[id].var_name = "";
      eventsCopy[id].var_value = {
        type: "text",
        text: "",
      };
    }
  }

  function removeEvent(id: number) {
    eventsCopy.splice(id, 1);
  }

  function saveEvents() {
    events = eventsCopy;
    eventsModal.click();
  }

  function closeEvents() {
    eventsModal.click();
  }

  function openVariableWindow(id: number) {
    currentEditingId = id;
    variablePopup.showModal();
  }

  function setVariable(
    type: string,
    variable: string,
    column: string,
    isRandomRow: boolean
  ) {
    eventsCopy[currentEditingId].var_value = {
      type: "variable",
      variableType: type,
      variable: variable,
      column: column,
      isRandomRow: isRandomRow,
    };
  }
</script>

<Variablepopup bind:this={variablePopup} {variables} onSave={setVariable}
></Variablepopup>

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
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {#each eventsCopy.entries() as [id, event] (id)}
            <tr>
              <td>
                <select
                  bind:value={event.type}
                  onchange={() => {
                    onChangeType(id);
                  }}
                  class="select select-bordered w-full max-w-xs"
                >
                  <option selected value="message"
                    >Message to parent window</option
                  >
                  <option value="variable">Set variable</option>
                </select>
              </td>
              {#if event.type == "message"}
                <td
                  ><input
                    type="text"
                    placeholder="Message to send to parent window"
                    class="input input-bordered w-full max-w-xs"
                    bind:value={event.content}
                  /></td
                >
              {:else}
                <td>
                  <input
                    type="text"
                    placeholder="Variable"
                    class="input input-bordered max-w-xs"
                    bind:value={event.var_name}
                  />
                  =
                  {#if event.var_value !== undefined && event.var_value.type !== undefined}
                    {#if event.var_value.type == "text"}
                      <input
                        type="text"
                        placeholder="Value"
                        class="input input-bordered max-w-xs"
                        bind:value={event.var_value.text}
                      />
                    {:else if event.var_value.type == "variable"}
                      {#if event.var_value.variable !== undefined}
                        <div class="badge badge-info mx-2">
                          <Variable class="w-3 h-3 mr-2" />
                          {#if event.var_value.isRandomRow !== undefined && event.var_value.isRandomRow}
                            random row
                          {:else}
                            {event.var_value.column}
                          {/if}
                          from {event.var_value.variable}
                        </div>
                      {/if}
                    {/if}
                  {/if}
                  <div class="tooltip" data-tip="Insert variable">
                    <button
                      class="btn btn-square btn-outline btn-sm mt-2 mb-2"
                      onclick={() => {
                        openVariableWindow(id);
                      }}
                    >
                      <Variable class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              {/if}
              <td
                ><button
                  class="btn btn-square btn-outline btn-sm"
                  onclick={() => {
                    removeEvent(id);
                  }}><Trash class="w-6 h-6" /></button
                ></td
              >
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
      <div
        class="btn"
        onclick={saveEvents}
        onkeydown={saveEvents}
        tabindex="0"
        role="button"
      >
        Save
      </div>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <div
        class="btn btn-outline"
        onclick={closeEvents}
        onkeydown={closeEvents}
        tabindex="0"
        role="button"
      >
        Cancel
      </div>
    </div>
  </div>
</div>

<button
  class="btn btn-square btn-sm {eventsCopy.length ? '' : 'btn-outline'}"
  onclick={editEvents}><Bolt class="w-6 h-6" /></button
>
