<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ProjectBlock } from "../../../../common/project/types";

  let draggable = $state() as HTMLDivElement;
  let isDragging: boolean = false;

  const {
    children,
    parent,
    block,
  }: { children: Snippet<[]>; parent: HTMLElement; block: ProjectBlock } =
    $props();

  const noDragHandle = $derived(
    draggable ? draggable.getElementsByClassName("no-drag-handle") : []
  );

  function mouseDown(e: MouseEvent) {
    const target = e.target! as HTMLElement;

    if (
      e.button === 0 &&
      Array.from(noDragHandle).every((el) => !el.contains(target))
    ) {
      isDragging = true;
    }
  }

  function mouseUp(e: MouseEvent) {
    if (e.button === 0 && isDragging) {
      isDragging = false;
    }
  }

  function mouseMove(e: MouseEvent) {
    if (isDragging) {
      block.x =
        Math.round((e.x - draggable.offsetWidth / 2 + parent.scrollLeft) / 20) *
        20;
      block.y =
        Math.round((e.y - draggable.offsetHeight / 2 + parent.scrollTop) / 20) *
        20;
    }
  }
</script>

<div
  bind:this={draggable}
  style:left="{block.x}px"
  style:top="{block.y}px"
  onmousedown={mouseDown}
  onmouseup={mouseUp}
  onmousemove={mouseMove}
  onmouseleave={mouseMove}
  class="select-none absolute"
  role="none"
>
  {@render children()}
</div>
