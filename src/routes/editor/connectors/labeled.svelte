<div class="relative text-sm font-medium">
    <div class="line-clamp-1">
        {label}
    </div>
    <span id="block_{blockId}_c_{connectorId}" data-block-id="{blockId}" data-connector-id="{connectorId}" class="indicator-item indicator-middle indicator-end badge z-0 -mr-3" ></span>
</div>

<script type="ts">
    import { onMount, createEventDispatcher } from "svelte";

    export let blockId = 0;
    export let connectorId = 0;
    export let label = '';

    const dispatch = createEventDispatcher();

    onMount(() => {
        dispatch('message', {
            event: 'connector_loaded',
            block_id: blockId,
            connector_id: connectorId
        });
    });

</script>