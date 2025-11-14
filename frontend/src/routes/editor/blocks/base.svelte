<script lang="ts">
  import { type Component, type SvelteComponent, onDestroy } from "svelte";
  import { Bolt, Pencil, Trash } from "svelte-heros-v2";
  import ConnectorPad from "./components/connectorpad.svelte";
  import type { ProjectBlock } from "../../../../../common/project/types.ts";
  import { setOrDelete } from "../../../../../common/svelte-utils";

  export type BlockProps = {
    blockId: string;
    block: ProjectBlock;
    lineLocation: {
      in?: { x: number; y: number };
      out: { x: number; y: number }[];
    };
    selected: boolean;
    select: Function;
    edit: Function;
    remove: Function;
  };

  type BaseBlockProps = BlockProps & {
    Icon: Component;
    children?: Function;
  };

  let {
    Icon,
    children,
    blockId,
    block,
    lineLocation = $bindable(),
    selected = false,
    select = (blockId: string) => {},
    edit = (blockId: string) => {},
    remove = (blockId: string) => {},
  }: BaseBlockProps = $props();

  let root = $state() as HTMLElement;
  let inConnectorPad = $state() as SvelteComponent;
  const outConnectorPads = $state([]) as SvelteComponent[];

  $effect(() => {
    const rect = root.getBoundingClientRect();

    if (inConnectorPad && block.x != undefined && block.y != undefined) {
      const padCoords = inConnectorPad.getCoords();
      lineLocation.in = {
        x: padCoords.x - rect.left + block.x,
        y: padCoords.y - rect.top + block.y,
      };
    } else {
      delete lineLocation.in;
    }

    const out = lineLocation.out;
    out.length = 0;
    if (block.x != undefined && block.y != undefined) {
      for (const [i, pad] of outConnectorPads.entries()) {
        if (pad) {
          const padCoords = pad.getCoords();
          out[i] = {
            x: padCoords.x - rect.left + block.x,
            y: padCoords.y - rect.top + block.y,
          };
        }
      }
    }
  });

  onDestroy(() => {
    console.log("Boom!");
    lineLocation = undefined as any;
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
  <ConnectorPad bind:this={inConnectorPad} {blockId} />

  {#if selected}
    <button
      class="btn btn-sm btn-circle btn-outline absolute -right-4 -top-4 no-drag-handle"
      onclick={removeBlock}><Trash class="w-4 h-4" /></button
    >

    <button
      class="btn btn-sm btn-circle btn-outline absolute -right-4 top-12 no-drag-handle"
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
      {#each block.connectors.entries() as [connectorId, connector] (connectorId)}
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
          <ConnectorPad
            bind:this={
              () => outConnectorPads[connectorId],
              (value) => setOrDelete(outConnectorPads, connectorId, value)
            }
            {blockId}
            {connectorId}
          />
        </div>
      {/each}
    {/if}
  </div>
</div>
