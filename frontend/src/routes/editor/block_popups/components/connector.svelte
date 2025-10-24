<script lang="ts">
  import { Bolt, Plus, Trash } from "svelte-heros-v2";
  import type {
    ProjectConnector,
    ProjectEvent,
  } from "../../../../../../common/project/types.ts";

  const {
    connector,
    remove,
    eventHeader,
    contentHeader,
    eventSnippet,
    contentSnippet,
    eventAddLabel,
  }: {
    connector: ProjectConnector;
    remove?: Function;
    eventHeader: string;
    contentHeader?: string;
    eventSnippet: Function;
    contentSnippet?: Function;
    eventAddLabel: string;
  } = $props();

  let eventsModal: HTMLInputElement;
  let eventsCopy: ProjectEvent[] = $state([]);

  function editEvents() {
    eventsCopy = JSON.parse(JSON.stringify(connector.events ?? []));
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
    connector.events = eventsCopy;
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
            <th>{eventHeader}</th>
            {#if contentHeader}
              <th>{contentHeader}</th>
            {/if}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {#each eventsCopy.entries() as [id, event] (id)}
            <tr>
              <td>{@render eventSnippet(id, event)}</td>
              {#if contentSnippet}
                <td>{@render contentSnippet(id, event)}</td>
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

      {eventAddLabel}
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

<tr>
  <td
    ><input
      type="text"
      placeholder="Type here"
      class="input input-bordered w-full max-w-xs"
      bind:value={connector.label}
    /></td
  >
  <td
    ><button
      class="btn btn-square btn-sm {connector.events === undefined
        ? 'btn-outline'
        : ''}"
      onclick={editEvents}><Bolt class="w-6 h-6" /></button
    ></td
  >
  {#if remove}
    <td
      ><button
        class="btn btn-square btn-outline btn-sm"
        onclick={() => {
          remove();
        }}><Trash class="w-6 h-6" /></button
      ></td
    >
  {/if}
</tr>
