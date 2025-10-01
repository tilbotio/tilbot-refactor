<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";

  /**
   * @typedef {Object} Props
   * @property {number} [blockId]
   * @property {number} [connectorId]
   * @property {string} [label]
   * @property {boolean} [hasEvents]
   */

  /** @type {Props} */
  let {
    blockId = 0,
    connectorId = 0,
    label = "",
    hasEvents = false,
  } = $props();

  const dispatch = createEventDispatcher();

  onMount(() => {
    dispatch("message", {
      event: "connector_loaded",
      block_id: blockId,
      connector_id: connectorId,
    });
  });
</script>

<div class="relative text-sm font-medium flex">
  <div class="line-clamp-1 flex-1">
    {label}
  </div>
  <div>
    {#if hasEvents}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="inline w-3 h-3"
      >
        <path
          fill-rule="evenodd"
          d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
          clip-rule="evenodd"
        />
      </svg>
    {/if}
  </div>
  <span
    id="block_{blockId}_c_{connectorId}"
    data-block-id={blockId}
    data-connector-id={connectorId}
    class="indicator-item indicator-middle indicator-end badge z-0 -mr-3"
  ></span>
</div>
