<script lang="ts">
  let span: HTMLElement;

  export function getCoords() {
    const rect = span.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }
</script>

<div class="absolute top-24 left-32 indicator select-none">
  <span
    bind:this={span}
    class="indicator-item indicator-bottom indicator-center badge"
    data-block-id="-1"
  ></span>
  <div class="pb-4">START</div>
</div>
