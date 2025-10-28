<script lang="ts">
  import { cloneDeep } from "lodash";

  import { Bolt, Plus, Trash } from "svelte-heros-v2";
  import type { ProjectEvent } from "../../../../../../common/project/types.js";

  let {
    events = $bindable(),
  }: {
    events?: ProjectEvent[];
  } = $props();

  let eventsModal: HTMLInputElement;
  let eventsCopy: ProjectEvent[] = $state([]);

  $effect.pre(() => {
    eventsCopy = cloneDeep(events ?? []);
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
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {#each eventsCopy.entries() as [id, event] (id)}
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
                  <input
                    type="text"
                    placeholder="Value"
                    class="input input-bordered max-w-xs"
                    bind:value={event.var_value}
                  />
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
