<script lang="ts">
  import { onDestroy } from "svelte";

  const { lineLocations } = $props();

  const left = 72;
  const top = 24;

  let root = $state() as HTMLElement;
  let span = $state() as HTMLElement;

  export const outConnectorPadCoords: { x: number; y: number }[] = $state([]);

  let oldLineLocations: any;

  $effect(() => {
    // Clean up previous array entry in case the lineLocations prop changed
    if (oldLineLocations != undefined && oldLineLocations !== lineLocations) {
      delete oldLineLocations["-1"];
    }
    oldLineLocations = lineLocations;
    const lineLocation = (lineLocations["-1"] ??= { out: [] });

    const rootRect = root.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    lineLocation.out[0] = {
      x: spanRect.left + spanRect.width / 2 - rootRect.left + left,
      y: spanRect.top + spanRect.height / 2 - rootRect.top + top,
    };
  });

  onDestroy(() => {
    if (oldLineLocations != undefined) {
      delete oldLineLocations["-1"];
    }
  });
</script>

<div
  bind:this={root}
  class="absolute left-72 top-24 indicator select-none"
>
  <span
    bind:this={span}
    class="indicator-item indicator-bottom indicator-center badge"
    data-block-id="-1"
  ></span>
  <div class="pb-4">START</div>
</div>
