<script lang="ts">
  import { onDestroy } from "svelte";

  let { lineLocation = $bindable() } = $props();

  const left = 288;
  const top = 96;

  let root = $state() as HTMLElement;
  let span = $state() as HTMLElement;

  export const outConnectorPadCoords: { x: number; y: number }[] = $state([]);

  $effect(() => {
    const rootRect = root.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    lineLocation.out[0] = {
      x: spanRect.left + spanRect.width / 2 - rootRect.left + left,
      y: spanRect.top + spanRect.height / 2 - rootRect.top + top,
    };
  });

  onDestroy(() => {
    lineLocation = undefined;
  });
</script>

<div
  bind:this={root}
  class="absolute left-[288px] top-[96px] indicator select-none"
>
  <span
    bind:this={span}
    class="indicator-item indicator-bottom indicator-center badge"
    data-block-id="-1"
  ></span>
  <div class="pb-4">START</div>
</div>
