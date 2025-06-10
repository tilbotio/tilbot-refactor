<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
<div class="card w-64 bg-slate-100 shadow-lg transition-transform indicator {selectedId == blockId ? 'scale-110 z-50' : ''}" id="block_{blockId}" on:click={click_event}>
    <span class="indicator-item indicator-middle indicator-start badge z-0" id="block_{blockId}_in" data-block-id="{blockId}"></span>

    {#if selectedId == blockId}
    <button class="btn btn-sm btn-circle btn-outline absolute -right-4 -top-4 btn_del" on:click={delete_block}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>          
    </button>

    <button class="btn btn-sm btn-circle btn-outline absolute -right-4 top-12 btn_edit" on:click={edit_block}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>          
    </button>

    {/if}

    <div class="card-body p-4">
        <div class="flex">
            <h2 class="card-title text-base grow">
                {objAttributes.name}
            </h2>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                </svg>
            </div>     
        </div>  
        <div class="text-sm min-h-6 max-h-16 line-clamp-3">
            {#if objAttributes.chatgpt_variation == true}
            <mark>
                {@html objAttributes.content}                
            </mark>
            {:else}
            {@html objAttributes.content}                
            {/if}
        </div>
        {#if objAttributes.connectors !== undefined && objAttributes.connectors.length > 0}
            <div class="divider m-0"></div>
            {#each Object.entries(objAttributes.connectors) as [id, connector]}
                <LabeledConnector blockId={blockId} connectorId={id} label={connector.label} hasEvents={(connector.events !== undefined && connector.events.length > 0)} on:message={handleConnectorMessage}></LabeledConnector>
            {/each}
        {/if}
        
    </div>
</div>

<script type="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import LabeledConnector from '../connectors/labeled.svelte';

    export let objAttributes = {};
    export let blockId = 0;
    export let selectedId = 0;

    const dispatch = createEventDispatcher();

    onMount(() => {
        if (objAttributes.connectors === undefined) {
            objAttributes.connectors = [];
        }
    });

    function handleConnectorMessage(e: Event) {
        // Pass through
        dispatch('message', {
            event: e.detail.event,
            block_id: e.detail.block_id,
            connector_id: e.detail.connector_id
        });
    }    

    function click_event(e: MouseEvent) {
        dispatch('message', {
            event: 'block_selected',
            block_id: blockId
        });

        e.stopPropagation();
    }

    function edit_block(e: MouseEvent) {
        dispatch('message', {
            event: 'edit_block',
            block_id: blockId
        });

        e.stopPropagation();
    }

    function delete_block(e: MouseEvent) {
        dispatch('message', {
            event: 'delete_block',
            block_id: blockId
        });

        e.stopPropagation();
    }

</script>