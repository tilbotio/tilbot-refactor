<script lang="ts">
  const { blockId, connectorId } = $props();

  let span: HTMLElement;

  export function getCoords() {
    const rect = span.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }
</script>

<span
  bind:this={span}
  id="block_{blockId}_c_{connectorId}"
  data-block-id={blockId}
  data-connector-id={connectorId}
  class="indicator-item indicator-middle indicator-end badge z-0 -mr-3"
></span>
