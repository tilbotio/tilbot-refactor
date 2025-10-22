<script lang="ts">
  import type { Component } from "svelte";
  import type {
    ProjectBlock,
    ProjectEvent,
  } from "../../../../../common/project/types.ts";
  import { Trash, Photo, Clock, Plus, Bolt } from "svelte-heros-v2";

  export type BlockPopupProps = {
    block: ProjectBlock;
  };

  type BaseBlockPopupProps = BlockPopupProps & {
    Icon: Component;
    children: Function;
    save: Function;
    cancel: Function;
    defaultProjectBlock?: ProjectBlock;
    eventHeader: string;
    contentHeader?: string;
    eventSnippet: Function;
    contentSnippet?: Function;
    eventAddLabel: string;
  };

  const {
    block,
    Icon,
    children,
    save,
    cancel,
    defaultProjectBlock,
    eventHeader = "Event type",
    eventSnippet,
    contentHeader,
    contentSnippet,
    eventAddLabel = "Add event",
  }: BaseBlockPopupProps = $props();

  let blockCopy = $state({}) as ProjectBlock;

  let eventsModal: HTMLInputElement;
  let eventsCopy = $state([]) as ProjectEvent[];
  let selectedConnectorId = $state(-1);

  let showImageSelector = $state(false);
  let imageCopy = $state("");

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


<span
  class="btn btn-sm btn-circle absolute right-2 top-2"
  onclick={() => {
    cancel();
  }}
  onkeydown={() => {
    cancel();
  }}
  tabindex="0"
  role="button">✕</span
>
<h3 class="text-lg font-bold">
  <Icon style="display: inline; vertical-align: sub" class="w-6 h-6" />

  <div
    class="inline"
    contenteditable="true"
    bind:textContent={blockCopy.name}
    onkeydown={ignoreEnterKey}
    onkeyup={ignoreEnterKey}
    role="textbox"
    tabindex="0"
  ></div>
</h3>

<div
  class="overflow-x-hidden overflow-y-auto"
  style="max-height: calc(100vh - 16em)"
>
  {@render children()}
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
