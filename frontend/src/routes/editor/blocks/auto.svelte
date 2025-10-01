<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import BasicConnector from "../connectors/basic.svelte";

  let {
    objAttributes = $bindable({}),
    blockId = $bindable(0),
    selectedId = $bindable(0),
  } = $props();

  const dispatch = createEventDispatcher();

  onMount(() => {
    if (objAttributes.connectors === undefined) {
      objAttributes.connectors = [];
    }
  });

  function click_event(e: MouseEvent) {
    dispatch("message", {
      event: "block_selected",
      block_id: blockId,
    });

    e.stopPropagation();
  }

  function edit_block(e: MouseEvent) {
    dispatch("message", {
      event: "edit_block",
      block_id: blockId,
    });

    e.stopPropagation();
  }

  function delete_block(e: MouseEvent) {
    dispatch("message", {
      event: "delete_block",
      block_id: blockId,
    });

    e.stopPropagation();
  }
</script>

<div
  class="card w-64 bg-slate-100 shadow-lg transition-transform indicator {selectedId ==
  blockId
    ? 'scale-110 z-50'
    : ''}"
  id="block_{blockId}"
  on:click={click_event}
>
  <span
    class="indicator-item indicator-middle indicator-start badge z-0"
    id="block_{blockId}_in"
    data-block-id={blockId}
  ></span>

  {#if selectedId == blockId}
    <button
      class="btn btn-sm btn-circle btn-outline absolute -right-4 -top-4 btn_del"
      on:click={delete_block}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-4 h-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
        />
      </svg>
    </button>

    <button
      class="btn btn-sm btn-circle btn-outline absolute -right-4 top-12 btn_edit"
      on:click={edit_block}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-4 h-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
        />
      </svg>
    </button>
  {/if}

  <div class="card-body p-4">
    <div class="flex">
      <h2 class="card-title text-base grow">
        {objAttributes.name}
      </h2>
      <div>
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
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>
    <div class="text-sm min-h-6 max-h-16 line-clamp-3">
      {#if objAttributes.chatgpt_variation == true}
        <mark>
          {@html objAttributes.content}
        </mark>
      {:else}
        {@html objAttributes.content}
      {/if}
    </div>
    {#if objAttributes.connectors !== undefined && objAttributes.connectors.length > 0}
      <div class="divider m-0"></div>
      {#each Object.entries(objAttributes.connectors) as [id, connector]}
        <BasicConnector
          {blockId}
          connectorId={id}
          hasEvents={connector.events !== undefined &&
            connector.events.length > 0}
        ></BasicConnector>
      {/each}
    {/if}
  </div>
</div>
