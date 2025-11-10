<script lang="ts">
  const left = 32;
  const top = 24;

  let root = $state() as HTMLElement;
  let span = $state() as HTMLElement;

  export const outConnectorPadCoords: { x: number; y: number }[] = $state([]);

  $effect(() => {
    const rootRect = root.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    outConnectorPadCoords[0] = {
      x: spanRect.left + spanRect.width / 2 - rootRect.left + left,
      y: spanRect.top + spanRect.height / 2 - rootRect.top + top,
    };
  });
</script>

<div
  bind:this={root}
  class="absolute left-{left} top-{top} indicator select-none"
>
  <span
    bind:this={span}
    class="indicator-item indicator-bottom indicator-center badge"
    data-block-id="-1"
  ></span>
  <div class="pb-4">START</div>
</div>
