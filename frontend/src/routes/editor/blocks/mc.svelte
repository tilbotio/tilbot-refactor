<script lang="ts">
  import { ListBullet, Pencil, Trash } from "svelte-heros-v2";
  import LabeledConnector from "../connectors/labeled.svelte";
  import type { ProjectBlock } from "../../../../../common/project/types.ts";

  const {
    blockId = $bindable(0),
    block = $bindable({} as ProjectBlock),
    selected = $bindable(false),
    connectorMounted = (connectorId: number) => {},
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
        <ListBullet class="w-6 h-6" />
      </div>
    </div>
    <div class="text-sm min-h-6 max-h-16 line-clamp-3">
      {@html block.content}
    </div>
    {#if block.connectors?.length > 0}
      <div class="divider m-0"></div>
      {#each block.connectors.entries() as [connectorId, connector]}
        <LabeledConnector
          {blockId}
          {connectorId}
          label={connector.label}
          hasEvents={connector.events?.length! > 0}
          mounted={() => connectorMounted(connectorId)}
        ></LabeledConnector>
      {/each}
    {/if}
  </div>
</div>
