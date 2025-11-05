<script lang="ts">
  import type { Component } from "svelte";
  import { Bolt, Pencil, Trash } from "svelte-heros-v2";
  import Connector from "../connector.svelte";
  import type { ProjectBlock } from "../../../../../common/project/types.ts";

  export type BlockProps = {
    blockId: number;
    block: ProjectBlock;
    selected: boolean;
    connectorMounted: Function;
    select: Function;
    edit: Function;
    remove: Function;
  };

  type BaseBlockProps = BlockProps & {
    Icon: Component;
    children?: Function;
  };

  const {
    Icon,
    children,
    blockId,
    block,
    selected = false,
    connectorMounted = (blockId: string, connectorId: number) => {},
    select = (blockId: string) => {},
    edit = (blockId: string) => {},
    remove = (blockId: string) => {},
  }: BaseBlockProps = $props();

  let root = $state() as HTMLElement;

  let inConnectorPad = $state() as any;
  const outConnectorPads = $state([]) as any[];

  // Position of input connector pad relative to the block component
  export const inConnectorPadOffset: { x?: number; y?: number } = $state({});

  // Position of each output connector pad relative to the block component
  export const outConnectorPadOffsets: { x: number; y: number }[] = $state([]);

  // $derived() expressions cannot be exported so use $effect()
  $effect(() => {
    const rect = root.getBoundingClientRect();
    if (inConnectorPad) {
      const padCoords = inConnectorPad.getCoords();
      inConnectorPadOffset.x = padCoords.x - rect.left;
      inConnectorPadOffset.y = padCoords.y - rect.top;
    } else {
      delete inConnectorPadOffset.x;
      delete inConnectorPadOffset.y;
    }
  });

  // $derived() expressions cannot be exported so use $effect()
  $effect(() => {
    const rect = root.getBoundingClientRect();
    outConnectorPadOffsets.length = 0;
    for (const [i, pad] of outConnectorPads.entries()) {
      if (pad) {
        const padCoords = pad.getCoords();
        outConnectorPadOffsets[i] = {
          x: padCoords.x - rect.left,
          y: padCoords.y - rect.top,
        };
      }
    }
  });

  function selectBlock(e: UIEvent) {
    select(blockId);
    e.stopPropagation();
  }

  function editBlock(e: UIEvent) {
    edit(blockId);
    e.stopPropagation();
  }

  function removeBlock(e: UIEvent) {
    remove(blockId);
    e.stopPropagation();
  }
</script>

<div
  bind:this={root}
  class="card w-64 bg-slate-100 shadow-lg transition-transform indicator {selected
    ? 'scale-110 z-50'
    : ''}"
  id="block_{blockId}"
  onclick={selectBlock}
  onkeydown={selectBlock}
  role="button"
  tabindex="0"
>
  <span
    bind:this={inConnectorPad}
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
        <div class="relative text-sm font-medium flex">
          <div class="line-clamp-1 flex-1">
            {#if connector.label}
              {connector.label}
            {/if}
          </div>
          <div>
            {#if connector.events?.length! > 0}
              <Bolt class="inline w-3 h-3" />
            {/if}
          </div>
          <Connector
            bind:this={outConnectorPads[connectorId]}
            {blockId}
            {connectorId}
          />
        </div>
      {/each}
    {/if}
  </div>
</div>
