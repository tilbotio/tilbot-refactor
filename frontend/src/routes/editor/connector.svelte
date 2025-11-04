<script lang="ts">
  import { Bolt } from "svelte-heros-v2";
  import { onMount } from "svelte";

  const {
    blockId,
    connectorId,
    hasEvents = false,
    mounted = () => {},
    label = "",
  } = $props();

  onMount(mounted as () => unknown);
</script>

<div class="relative text-sm font-medium flex">
  <div class="line-clamp-1 flex-1">
    {#if label}
      {label}
    {/if}
  </div>
  <div>
    {#if hasEvents}
      <Bolt class="inline w-3 h-3" />
    {/if}
  </div>
  <span
    id="block_{blockId}_c_{connectorId}"
    data-block-id={blockId}
    data-connector-id={connectorId}
    class="indicator-item indicator-middle indicator-end badge z-0 -mr-3"
  ></span>
</div>
