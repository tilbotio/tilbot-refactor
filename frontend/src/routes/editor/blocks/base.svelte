<script lang="ts">
  import { Pencil, Trash } from "svelte-heros-v2";
  import Connector from "../connector.svelte";

  const {
    Icon,
    children = null,
    blockId,
    block,
    selected = false,
    connectorMounted = (blockId: string, connectorId: number) => {},
    select = (blockId: string) => {},
    edit = (blockId: string) => {},
    remove = (blockId: string) => {},
  } = $props();

  function selectBlock(e: MouseEvent) {
    select(blockId);
    e.stopPropagation();
  }

  function editBlock(e: MouseEvent) {
    edit(blockId);
    e.stopPropagation();
  }

  function removeBlock(e: MouseEvent) {
    remove(blockId);
    e.stopPropagation();
  }
</script>

<div
  class="card w-64 bg-slate-100 shadow-lg transition-transform indicator {selected
    ? 'scale-110 z-50'
    : ''}"
  id="block_{blockId}"
  onclick={selectBlock}
>
  <span
    class="indicator-item indicator-middle indicator-start badge z-0"
    id="block_{blockId}_in"
    data-block-id={blockId}
  ></span>

  {#if selected}
    <button
      class="btn btn-sm btn-circle btn-outline absolute -right-4 -top-4 btn_del"
      onclick={removeBlock}><Trash class="w-4 h-4" /></button
    >

    <button
      class="btn btn-sm btn-circle btn-outline absolute -right-4 top-12 btn_edit"
      onclick={editBlock}><Pencil class="w-4 h-4" /></button
    >
  {/if}

  <div class="card-body p-4">
    <div class="flex">
      <h2 class="card-title text-base grow">
        {block.name}
      </h2>
      <div>
        <Icon class="w-6 h-6" />
      </div>
    </div>
    {#if children}
      <div class="text-sm min-h-6 max-h-16 line-clamp-3">
        {@render children()}
      </div>
    {/if}
    {#if block.connectors?.length > 0}
      <div class="divider m-0"></div>
      {#each block.connectors.entries() as [connectorId, connector]}
        <Connector
          {blockId}
          {connectorId}
          label={connector.label}
          hasEvents={connector.events?.length! > 0}
          mounted={() => connectorMounted(connectorId)}
        ></Connector>
      {/each}
    {/if}
  </div>
</div>
