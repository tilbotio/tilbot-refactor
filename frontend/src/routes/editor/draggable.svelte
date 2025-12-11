<script lang="ts">
  import { onMount } from "svelte";

  let draggable: HTMLDivElement;
  let isDragging: boolean = false;
  let hasMoved: boolean = false;

  let {
    block,
    children,
    editor_main,
    mounted = () => {},
    dragStart = () => {},
    drag = () => {},
    dragDrop = () => {},
  } = $props();

  onMount(mounted as () => unknown);

  function mouseDown(e: MouseEvent) {
    const btn_del = draggable.getElementsByClassName("btn_del");
    const btn_edit = draggable.getElementsByClassName("btn_edit");
    const target = e.target! as HTMLElement;
    const connectorId = target.getAttribute("data-connector-id");

    if (
      e.button == 0 &&
      connectorId === null &&
      (btn_del.length == 0 || !btn_del[0].contains(target)) &&
      (btn_edit.length == 0 || !btn_edit[0].contains(target))
    ) {
      isDragging = true;
      hasMoved = false;

      dragStart();
    }
  }

  function mouseUp(e: MouseEvent) {
    if (e.button == 0 && isDragging) {
      isDragging = false;

      if (hasMoved) {
        block.x =
          Math.round(
            (e.x - draggable.offsetWidth / 2 + editor_main.scrollLeft) / 20
          ) * 20;
        block.y =
          Math.round(
            (e.y - draggable.offsetHeight / 2 + editor_main.scrollTop) / 20
          ) * 20;

        dragDrop();
      }
    }
  }

  function mouseMove(e: MouseEvent) {
    if (isDragging) {
      hasMoved = true;

      draggable.style.left =
        Math.round(
          (e.x - draggable.offsetWidth / 2 + editor_main.scrollLeft) / 20
        ) *
          20 +
        "px";
      draggable.style.top =
        Math.round(
          (e.y - draggable.offsetHeight / 2 + editor_main.scrollTop) / 20
        ) *
          20 +
        "px";
      drag();
    }
  }
</script>

<div
  bind:this={draggable}
  style="left: {block.x}px; top: {block.y}px"
  onmousedown={mouseDown}
  onmouseup={mouseUp}
  onmousemove={mouseMove}
  onmouseleave={mouseMove}
  class="select-none absolute"
  role="none"
>
  {@render children()}
</div>
